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

    /**
     * Unique name that uses as key for state
     */
    name: string;
    /**
     * Reducer function. Can be used as classic Reducer
     */
    reducer: Reducer<TState>;
}

export interface INamedSubscriber<TState> {
    /**
     * Unique name. Used for adding / updating listener
     */
    name: string;
    /**
     * Listener function that accpets action and state
     */
    handler: ActionsHandler<TState>;
}

export interface IRootReducer<TState, TReducerState>
    extends INamedReducer<TReducerState> {

    /**
     * Dot separated path string to current [[ISubReducer]]
     */
    path: string;

    /**
     * Set reducer for action, you cant set only one reducer per action.
     * @param action Any redux action, or action created with [[action.createAction()]] or [[action.createPayloadAction()]]
     * @param reducer Function that accepts state and payload (if action have) arguments,
     * must return object to update state immutable.
     * @returns this
     */
    on<TPayload>(action: IExtendAction<TPayload>, reducer: ActionReducer<TReducerState, TPayload>): this;

    /**
     * Set reducer for actions, you cant set only one reducer per action.
     * @param actions Array of any redux actions, or actions created with [[action.createAction()]]
     * or [[action.createPayloadAction()]]
     * @param reducer Function that accepts state and payload (if action have) arguments,
     * must return object to update state immutable.
     * @returns this
     */
    on<TPayload>(actions: Array<IExtendAction<TPayload>>, reducer: ActionReducer<TReducerState, TPayload>): this;
    on<TPayload>(actions: IExtendAction<TPayload> | Array<IExtendAction<TPayload>>, reducer: ActionReducer<TReducerState, TPayload>): this;

    /**
     * Join [[ISubReducer]] to another. If [[ISubReducer]] with same name already joined,
     * it will be unjoined before joining new.
     * @param reducer Any aren't joined before [[ISubReducer]] instance
     * @returns this
     */
    join<T extends TReducerState[keyof TReducerState]>(reducer: ISubReducer<TReducerState, T>): this;

    /**
     * Join reducer to subreducer. If reducer with same name already joined,
     * it will be unjoined before joining new.
     * @param {string} name That argument is key in state object. Same as [[ISubReducer.name]]
     * @param {(state: T, action: any) => T} reducer Reducer function
     * @returns {this} this
     */
    joinReducer<T extends TReducerState[keyof TReducerState]>(name: keyof TReducerState, reducer: (state: T, action: any) => T): this;

    /**
     * Join [[ActionsHandler]] to reducer, that listen all actions. If listener with same `name`
     * already joined, it will be unjoined before joining new.
     * @param {string} name Key for listener
     * @param {ActionsHandler} handler Function that accpets `action` & `state` as params
     * @returns {this} this
     */
    joinListener(name: string, handler: ActionsHandler<TState>): this;
}

export interface ISubReducer<TState, TReducerState>
    extends IRootReducer<TState, TReducerState> {

    /**
     * Sets parent that's [[ISubReducer]] was joined
     * @param {any} state Root reducer state
     * @returns {any} SubReducer state
     */
    setParent(reducer: ISubReducer<any, TState>): void;

    /**
     * Accepts root reducer state object and returns [[ISubReducer]] state object.
     * @param {any} state Root reducer state
     * @returns {any} ISubReducer state
     */
    stateSelector(state: any): TReducerState;
}
/**
 * Name for [[RootReducer]]
 */
const RootReducerName = "@root";

/**
 * [[SubReducer]] it's a class thats give acces to some additional functions to help build complicated reducers.
 */
export class SubReducer<TState, TReducerState>
    implements ISubReducer<TState, TReducerState> {

    protected _name: string;
    private initState: Partial<TReducerState>;
    private actionReducerList: IActionReducerList<TReducerState>;
    private reducers: Array<INamedReducer<any>>;
    private subscribers: Array<INamedSubscriber<any>>;
    private parent!: ISubReducer<any, TState>;

    /**
     * Initialize [[SubReducer]] class with given `name` (key) and `[initState]`
     * Object that holds functions to manage subreducer, `join` reducers, `on` add per-action reducers,
     * `stateSelector` select state controlled by reducer from app state,
     * reducer getting reducer for connecting with redux.
     * @param name That argument is key in state object.
     * @param initState he initial state.
     * You may optionally specify it to hydrate the state from the server in universal apps,
     * or to restore a previously serialized user session. If you join another reducer,
     * this must be a plain object with the same shape as the keys passed to it.
     * Otherwise, you are free to pass anything that your reducer can understand.
     */
    constructor(name: string, initState?: Partial<TReducerState>) {
        this.initState = initState || {} as any;
        this.actionReducerList = {} as any;
        this.reducers = [];
        this.subscribers = [];
        this._name = name;
    }

    /**
     * Returns [[_name]]
     */
    get name() {
        return this._name;
    }

    /**
     * Returns [[parent]].[[path]].[[_name]]
     */
    get path() {
        return `${this.parent.path}.${this._name}`;
    }

    /**
     * Select subreducer controlled state from root state
     * @param state The state that you can get from `store.getState()`
     */
    stateSelector = state => this.parent.stateSelector(state)[this._name];

    /**
     * Set given `reducer` to [[parent]]
     */
    setParent = (reducer: ISubReducer<any, TState>) => {
        this.parent = reducer;
    }

    /**
     * Reducer function that reduce given `state` with `action` and returns new state.
     * Also call each [[subscribers]] `handler`.
     * If current `state` is function, call it with `action` as first argument and returns result.
     * If current `state` and [[initState]] not a object (example `string` or `number`) pass `state`
     * to [[ActionReducer]] and returns result.
     * If current `state` is `object` reduce all joined `ISubReducer` ([[reducers]])
     * after pass `state` to [[ActionReducer]] and returns result.
     */
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

    /**
     * Map given [[ActionReducer]] to `actionReducerList` with [[IExtendAction.type]] as key
     * @param actions Action or actions array
     * @param reducer Action reducer
     */
    on<TPayload>(
        actions: IExtendAction<TPayload> | Array<IExtendAction<TPayload>>,
        reducer: ActionReducer<TReducerState, TPayload>,
    ) {
        if (Array.isArray(actions)) {
            actions.forEach(({ type }) => {
                this.actionReducerList[type] = reducer;
            });
        } else {
            this.actionReducerList[actions.type] = reducer;
        }
        return this;
    }

    /**
     * Join subreducer to another. If subreducer with same name already joined, it will be
     * unjoined before joining new.
     * @param reducer SubReducer
     */
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

    /**
     * Returns [[_name]]
     */
    get path() {
        return this._name;
    }

    /**
     * Returns same `state`
     */
    stateSelector = state => state;
}

/**
 * Initialize [[RootReducer]] class with given `initState`, its special reducer for passing to `createStore`
 * @param initState The initial state.
 * You may optionally specify it to hydrate the state from the server in universal apps,
 * or to restore a previously serialized user session. If you join another reducer,
 * this must be a plain object with the same shape as the keys passed to it.
 * Otherwise, you are free to pass anything that your reducer can understand.
 */
export function createRootReducer<TState>(initState?: Partial<TState>): IRootReducer<TState, TState> {
    return new RootReducer<TState>(initState);
}
/**
 * Initialize [[SubReducer]] class with given `name` (key) and [initState]
 * @param name That argument is key in state object.
 * @param initState The initial state.
 * You may optionally specify it to hydrate the state from the server in universal apps,
 * or to restore a previously serialized user session. If you join another reducer,
 * this must be a plain object with the same shape as the keys passed to it.
 * Otherwise, you are free to pass anything that your reducer can understand.
 */
export function createSubReducer<TParentState, TState>(
    name: keyof TParentState,
    initState?: Partial<TState>,
): ISubReducer<TParentState, TState> {
    return new SubReducer<TParentState, TState>(name, initState);
}
