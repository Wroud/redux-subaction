import { Reducer } from "redux";
import { getActionMeta, IExtendAction } from "./action";

export type IActionReducer<TState, TPayload> = (state: TState, payload: TPayload) => Partial<TState>;

interface IActionReducerList<TState> {
    [key: string]: IActionReducer<TState, any>;
}

export interface INamedReducer<TState> {
    name: string;
    reducer: Reducer<TState>;
}

export interface INamedSubscriber<TState> {
    name: string;
    handler: (state: TState, action: any) => void;
}

export interface ISubReducer<TState, TReducerState>
    extends INamedReducer<TReducerState> {

    path: string;

    setLinkToParent: <TS>(reducer: ISubReducer<TState, TS>) => void;
    stateSelector: (state: any) => TReducerState;
    on: <TPayload>(action: IExtendAction<TPayload>, reducer: IActionReducer<TReducerState, TPayload>) => this;
    join: <T extends TReducerState[keyof TReducerState]>(reducer: ISubReducer<TState, T>) => this;
    joinReducer: <T extends TReducerState[keyof TReducerState]>(name: keyof TReducerState, reducer: (state: T, action: any) => T) => this;
    joinListener: (name: string, handler: (state: any, action: any) => void) => this;
}

const MainReducerName = "MainReducer";

export class SubReducer<TState, TReducerState>
    implements ISubReducer<TState, TReducerState> {

    protected _name: string;
    private initState: Partial<TReducerState>;
    private actionReducerList: IActionReducerList<TReducerState>;
    private reducers: Array<INamedReducer<any>>;
    private subscribers: Array<INamedSubscriber<any>>;
    private parent!: ISubReducer<TState, any>;

    constructor(name: string, initState?: Partial<TReducerState>) {
        this.initState = initState || {} as any;
        this.actionReducerList = {} as any;
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

    stateSelector = state => this.parent.stateSelector(state)[this._name];

    setLinkToParent = <TR>(reducer: ISubReducer<TState, TR>) => {
        this.parent = reducer;
    }

    reducer: Reducer<TReducerState> = (state, action) => {
        let nextState: TReducerState = { ...state as any };

        if (!state) {
            nextState = { ...this.initState as any };
        }

        this.reducers.forEach(reducer => {
            nextState[reducer.name] = reducer.reducer(nextState[reducer.name], action);
        });

        this.subscribers.forEach(subscriber => {
            subscriber.handler(nextState, action);
        });

        if (!this.actionReducerList[action.type]) {
            // if (this._name === MainReducerName) {
            //     this.logActionInfo(action);
            //     console.log("Next app state: ", nextState);
            // }
            return nextState;
        }

        const { type, payload } = action as IExtendAction<any>;
        const diff = this.actionReducerList[type](nextState, payload || {});
        this.deepExtend(nextState, diff);

        console.log("Reducer: ", this.path);
        this.logActionInfo(action);
        console.log("State / Next state / Diff: ", state, nextState, diff);
        console.log("---");

        return nextState;
    }

    on = <TPayload>({ type }: IExtendAction<TPayload>, state: IActionReducer<TReducerState, TPayload>) => {
        this.actionReducerList[type] = state;
        return this;
    }

    join = <T extends TReducerState[keyof TReducerState]>(reducer: ISubReducer<TState, T>) => {
        this.reducers = this.reducers.filter(el => el.name !== reducer.name);
        reducer.setLinkToParent(this as any);
        this.reducers.push(reducer);
        return this;
    }

    joinReducer = <T extends TReducerState[keyof TReducerState]>(name: keyof TReducerState, reducer: (state: T, action: any) => T) => {
        this.reducers = this.reducers.filter(el => el.name !== name);
        this.reducers.push({ name, reducer });
        return this;
    }

    joinListener = (name: string, handler: (state: TState, action: any) => void) => {
        this.subscribers = this.subscribers.filter(el => el.name !== name);
        this.subscribers.push({ name, handler });
        return this;
    }

    private logActionInfo(action: IExtendAction<any>) {
        // if ((action as any).logged) {
        //     return;
        // }
        // (action as any).logged = true;
        const { description, from } = getActionMeta(action);
        if (description) {
            console.log(`${from || "Description"}: `, description, action);
        } else {
            console.log("Action: ", action);
        }
    }

    private deepExtend = (destination, source) => {
        if (Array.isArray(destination)) {
            destination.length = 0;
            destination.push.apply(destination, source);
            return;
        }
        for (const property in source) {
            if (typeof source[property] === "object"
                && source[property] !== null
                && !Array.isArray(source[property])) {

                destination[property] = { ...destination[property] } || {};
                this.deepExtend(destination[property], source[property]);
            } else if (source[property] !== "__delete__") {
                destination[property] = source[property];
            } else {
                delete destination[property];
            }
        }
    }
}

export class MainReducer<TState>
    extends SubReducer<TState, TState> {

    constructor(initState?: Partial<TState>) {
        super(MainReducerName, initState);
    }

    get path() {
        return this._name;
    }

    stateSelector = state => state;
}

export function createMainReducer<TState>(initState?: Partial<TState>): ISubReducer<TState, TState> {
    return new MainReducer<TState>(initState);
}
export function createSubReducer<TParentState, TState>(name: keyof TParentState, initState?: Partial<TState>): ISubReducer<TParentState, TState> {
    return new SubReducer<TParentState, TState>(name, initState);
}
