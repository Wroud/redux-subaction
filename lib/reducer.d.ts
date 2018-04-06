import { Reducer } from "redux";
import { IExtendAction } from "./action";
export declare type IActionReducer<TState, TPayload> = (state: TState, payload: TPayload) => Partial<TState>;
export interface INamedReducer<TState> {
    name: string;
    reducer: Reducer<TState>;
}
export interface INamedSubscriber<TState> {
    name: string;
    handler: (state: TState, action: any) => void;
}
export interface ISubReducer<TState, TReducerState> extends INamedReducer<TReducerState> {
    path: string;
    setLinkToParent: <TS>(reducer: ISubReducer<TState, TS>) => void;
    stateSelector: (state: any) => TReducerState;
    on: <TPayload>(action: IExtendAction<TPayload>, reducer: IActionReducer<TReducerState, TPayload>) => this;
    join: <T extends TReducerState[keyof TReducerState]>(reducer: ISubReducer<TState, T>) => this;
    joinReducer: <T extends TReducerState[keyof TReducerState]>(name: keyof TReducerState, reducer: (state: T, action: any) => T) => this;
    joinListener: (name: string, handler: (state: any, action: any) => void) => this;
}
export declare class SubReducer<TState, TReducerState> implements ISubReducer<TState, TReducerState> {
    protected _name: string;
    private initState;
    private actionReducerList;
    private reducers;
    private subscribers;
    private parent;
    constructor(name: string, initState?: Partial<TReducerState>);
    readonly name: string;
    readonly path: string;
    stateSelector: (state: any) => any;
    setLinkToParent: <TR>(reducer: ISubReducer<TState, TR>) => void;
    reducer: Reducer<TReducerState>;
    on: <TPayload>({ type }: IExtendAction<TPayload>, state: IActionReducer<TReducerState, TPayload>) => this;
    join: <T extends TReducerState[keyof TReducerState]>(reducer: ISubReducer<TState, T>) => this;
    joinReducer: <T extends TReducerState[keyof TReducerState]>(name: keyof TReducerState, reducer: (state: T, action: any) => T) => this;
    joinListener: (name: string, handler: (state: TState, action: any) => void) => this;
    private logActionInfo(action);
    private deepExtend;
}
export declare class MainReducer<TState> extends SubReducer<TState, TState> {
    constructor(initState?: Partial<TState>);
    readonly path: string;
    stateSelector: (state: any) => any;
}
export declare function createMainReducer<TState>(initState?: Partial<TState>): ISubReducer<TState, TState>;
export declare function createSubReducer<TParentState, TState>(name: keyof TParentState, initState?: Partial<TState>): ISubReducer<TParentState, TState>;
