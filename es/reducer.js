import { getActionMeta } from "./action";
import { Logging, LoggingLevel } from "./config";
import { deepExtend } from "./tools";
const RootReducerName = "@root";
export class SubReducer {
    constructor(name, initState) {
        this.stateSelector = state => this.parent.stateSelector(state)[this._name];
        this.setParent = (reducer) => {
            this.parent = reducer;
        };
        this.reducer = (state, action) => {
            this.subscribers.forEach(subscriber => {
                subscriber.handler(state, action);
            });
            if (typeof state === "function") {
                return state(action);
            }
            if (typeof state !== "object" && typeof this.initState !== "object") {
                const { type, payload } = action;
                const actionReducer = this.actionReducerList[type];
                let nextState = Object.assign({}, state);
                if (state === undefined) {
                    nextState = this.initState;
                }
                if (!actionReducer) {
                    return nextState;
                }
                nextState = actionReducer(state, payload || {});
                if (Logging.level >= LoggingLevel.info) {
                    console.log("Reducer: ", this.path);
                    this.logActionInfo(action);
                    console.log("State / Next state / Diff: ", state, nextState);
                    console.log("---");
                }
                return nextState;
            }
            else {
                let nextState = Object.assign({}, state);
                if (!state) {
                    nextState = Object.assign({}, this.initState);
                }
                this.reducers.forEach(reducer => {
                    nextState[reducer.name] = reducer.reducer(nextState[reducer.name], action);
                });
                const { type, payload } = action;
                const actionReducer = this.actionReducerList[type];
                if (!actionReducer) {
                    return nextState;
                }
                const diff = actionReducer(nextState, payload || {});
                deepExtend(nextState, diff);
                if (Logging.level >= LoggingLevel.info) {
                    console.log("Reducer: ", this.path);
                    this.logActionInfo(action);
                    console.log("State / Next state / Diff: ", state, nextState, diff);
                    console.log("---");
                }
                return nextState;
            }
        };
        this.initState = initState || {};
        this.actionReducerList = {};
        this.reducers = [];
        this.subscribers = [];
        this._name = name;
    }
    get name() {
        return this._name;
    }
    get path() {
        return `${this.parent.path}.${this._name}`;
    }
    on(actions, reducer) {
        if (Array.isArray(actions)) {
            actions.forEach(({ type }) => {
                this.actionReducerList[type] = reducer;
            });
        }
        else {
            this.actionReducerList[actions.type] = reducer;
        }
        return this;
    }
    join(reducer) {
        this.reducers = this.reducers.filter(el => el.name !== reducer.name);
        reducer.setParent(this);
        this.reducers.push(reducer);
        return this;
    }
    joinReducer(name, reducer) {
        this.reducers = this.reducers.filter(el => el.name !== name);
        this.reducers.push({ name, reducer, initState: {} });
        return this;
    }
    joinListener(name, handler) {
        this.subscribers = this.subscribers.filter(el => el.name !== name);
        this.subscribers.push({ name, handler });
        return this;
    }
    logActionInfo(action) {
        const { description, from } = getActionMeta(action);
        if (description) {
            console.log(`${from || "Description"}: `, description, action);
        }
        else {
            console.log("Action: ", action);
        }
    }
}
export class RootReducer extends SubReducer {
    constructor(initState) {
        super(RootReducerName, initState);
        this.stateSelector = state => state;
    }
    get path() {
        return this._name;
    }
}
export function getState(reducers, map) {
    return state => {
        const stateMap = {};
        Object.keys(reducers).forEach(key => {
            stateMap[key] = reducers[key].stateSelector(state);
        });
        return map(stateMap);
    };
}
export function createRootReducer(initState) {
    return new RootReducer(initState);
}
export function createSubReducer(name, initState) {
    return new SubReducer(name, initState);
}
