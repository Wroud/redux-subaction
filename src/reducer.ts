import { Reducer } from "redux";
import { getActionMeta, IExtendAction } from "./action";
import { Logging, LoggingLevel } from "./config";
import { deepExtend } from "./tools";

export type ActionReducer<TState, TPayload> = (state: TState, payload: TPayload) => Partial<TState>;
export type ActionsHandler<TState> = (state: TState, action: any) => void;

interface IActionReducerList<TState> {
    [key: string]: ActionReducer<TState, any>;
}

export interface INamedReducer<TState> {
    name: string;
    reducer: Reducer<TState>;
}

export interface INamedSubscriber<TState> {
    name: string;
    handler: ActionsHandler<TState>;
}

export interface IRootReducer<TState, TReducerState>
    extends INamedReducer<TReducerState> {

    path: string;

    on: <TPayload>(action: IExtendAction<TPayload>, reducer: ActionReducer<TReducerState, TPayload>) => this;
    join: <T extends TReducerState[keyof TReducerState]>(reducer: ISubReducer<TReducerState, T>) => this;
    joinReducer: <T extends TReducerState[keyof TReducerState]>(name: keyof TReducerState, reducer: (state: T, action: any) => T) => this;
    joinListener: (name: string, handler: ActionsHandler<TState>) => this;
}

export interface ISubReducer<TState, TReducerState>
    extends IRootReducer<TState, TReducerState> {

    setParent: (reducer: ISubReducer<any, TState>) => void;
    stateSelector: (state: any) => TReducerState;
}

const RootReducerName = "@root";

export class SubReducer<TState, TReducerState>
    implements ISubReducer<TState, TReducerState> {

    protected _name: string;
    private initState: Partial<TReducerState>;
    private actionReducerList: IActionReducerList<TReducerState>;
    private reducers: Array<INamedReducer<any>>;
    private subscribers: Array<INamedSubscriber<any>>;
    private parent!: ISubReducer<any, TState>;

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

    setParent = (reducer: ISubReducer<any, TState>) => {
        this.parent = reducer;
    }

    reducer: Reducer<TReducerState> = (state, action) => {
        this.subscribers.forEach(subscriber => {
            subscriber.handler(state, action);
        });

        if (typeof state === "function") {
            return (state as any)(action);
        }

        if (typeof state !== "object" && typeof this.initState !== "object") {
            const { type, payload } = action as IExtendAction<any>;
            const actionReducer = this.actionReducerList[type];

            let nextState: TReducerState = { ...state as any };
            if (state === undefined) {
                nextState = this.initState;
            }

            if (!actionReducer) {
                return nextState;
            }

            nextState = actionReducer(state, payload || {}) as TReducerState;

            if (Logging.level >= LoggingLevel.info) {
                console.log("Reducer: ", this.path);
                this.logActionInfo(action);
                console.log("State / Next state / Diff: ", state, nextState);
                console.log("---");
            }

            return nextState;
        } else {
            let nextState: TReducerState = { ...state as any };

            if (!state) {
                nextState = { ...this.initState as any };
            }

            this.reducers.forEach(reducer => {
                nextState[reducer.name] = reducer.reducer(nextState[reducer.name], action);
            });

            const { type, payload } = action as IExtendAction<any>;
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
    }

    on<TPayload>(
        { type }: IExtendAction<TPayload>,
        state: ActionReducer<TReducerState, TPayload>,
    ) {
        this.actionReducerList[type] = state;
        return this;
    }

    join<T extends TReducerState[keyof TReducerState]>(
        reducer: ISubReducer<TReducerState, T>,
    ) {
        this.reducers = this.reducers.filter(el => el.name !== reducer.name);
        reducer.setParent(this);
        this.reducers.push(reducer);
        return this;
    }

    joinReducer<T extends TReducerState[keyof TReducerState]>(
        name: keyof TReducerState,
        reducer: (state: T, action: any) => T,
    ) {
        this.reducers = this.reducers.filter(el => el.name !== name);
        this.reducers.push({ name, reducer });
        return this;
    }

    joinListener(
        name: string,
        handler: (state: TState, action: any) => void,
    ) {
        this.subscribers = this.subscribers.filter(el => el.name !== name);
        this.subscribers.push({ name, handler });
        return this;
    }

    private logActionInfo(action: IExtendAction<any>) {
        const { description, from } = getActionMeta(action);
        if (description) {
            console.log(`${from || "Description"}: `, description, action);
        } else {
            console.log("Action: ", action);
        }
    }
}

export class RootReducer<TState>
    extends SubReducer<TState, TState> {

    constructor(initState?: Partial<TState>) {
        super(RootReducerName, initState);
    }

    get path() {
        return this._name;
    }

    stateSelector = state => state;
}

export function createRootReducer<TState>(initState?: Partial<TState>): IRootReducer<TState, TState> {
    return new RootReducer<TState>(initState);
}
export function createSubReducer<TParentState, TState>(
    name: keyof TParentState,
    initState?: Partial<TState>,
): ISubReducer<TParentState, TState> {
    return new SubReducer<TParentState, TState>(name, initState);
}
