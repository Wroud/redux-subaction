import { Action, ActionCreatorsMapObject, Dispatch } from "redux";
export interface IExtendAction<TData = {}> extends Action {
    payload?: TData;
    fromComponentId?: string;
    forComponentId?: string;
}
export interface IPayloadAction<TData> extends IExtendAction<TData> {
    payload: TData;
}
export interface IActionMeta {
    action: IExtendAction<any>;
    description?: string;
    from?: string;
}
export interface IActionsClass {
    [key: string]: IExtendAction<any>;
}
export interface IActionsGroups {
    [key: string]: IActionsClass;
}
export declare type ActionCreator<TA extends IExtendAction> = (payload?: TA["payload"], forComponentId?: string) => TA;
export declare type TransformActionsClass<T extends IActionsClass> = {
    [P in keyof T]: ActionCreator<T[P]>;
};
export declare type TransformActionsGroups<T extends IActionsGroups> = {
    [P in keyof T]: TransformActionsClass<T[P]>;
};
export declare type TransformActionsToMaps<T extends IActionsGroups> = {
    [P in keyof T]: (dispatch: Dispatch<Action>) => {
        actions: TransformActionsClass<T[P]>;
    };
};
export declare type TransformCreatorsToMaps<T extends IActionsGroups> = {
    [P in keyof T]: {
        actions: TransformActionsClass<T[P]>;
    };
};
export interface IActionsResult<T extends IActionsGroups> {
    actions: T;
    creators: TransformActionsGroups<T>;
    mapDispatch: TransformActionsToMaps<T>;
    mapCreators: TransformCreatorsToMaps<T>;
}
export declare function createAction(description?: string, from?: string): IExtendAction<{}>;
export declare function createPayloadAction<TData>(description?: string, from?: string): IPayloadAction<TData>;
export declare const getActionMeta: ({ type }: IExtendAction<any>) => IActionMeta;
export declare const getCreators: <T extends IActionsClass>(actions: T) => TransformActionsClass<T>;
export declare const getActionCreator: (action: Action) => (forComponentId?: string) => {
    forComponentId: string;
    type: any;
};
export declare const getPayloadCreator: <TData>(action: IPayloadAction<TData>) => (payload: TData, forComponentId?: string) => {
    payload: TData;
    forComponentId: string;
    fromComponentId?: string;
    type: any;
};
export declare const mapToActions: <T extends ActionCreatorsMapObject>(actions: T) => {
    actions: T;
};
export declare const mapDispatchToCreators: <T extends ActionCreatorsMapObject>(actions: {
    actions: T;
}) => (dispatch: Dispatch<Action>) => {
    actions: T;
};
export declare const prepareActions: <T extends IActionsGroups>(actions: T) => IActionsResult<T>;
