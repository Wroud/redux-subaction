import {
    Action,
    ActionCreator as ReduxActionCreator,
    ActionCreatorsMapObject,
    bindActionCreators,
    Dispatch,
} from "redux";

export interface IExtendAction<TData = {}>
    extends Action {

    payload?: TData;
    fromComponentId?: string;
    forComponentId?: string;
}

export interface IPayloadAction<TData>
    extends IExtendAction<TData> {

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

export type ActionCreator<TA extends IExtendAction> = (payload?: TA["payload"], forComponentId?: string) => TA;

export type TransformActionsClass<T extends IActionsClass> = {
    [P in keyof T]: ActionCreator<T[P]>;
};

export type TransformActionsGroups<T extends IActionsGroups> = {
    [P in keyof T]: TransformActionsClass<T[P]>;
};

export type TransformActionsToMaps<T extends IActionsGroups> = {
    [P in keyof T]: (dispatch: Dispatch<Action>) => { actions: TransformActionsClass<T[P]> };
};

export type TransformCreatorsToMaps<T extends IActionsGroups> = {
    [P in keyof T]: { actions: TransformActionsClass<T[P]> };
};

export interface IActionsResult<T extends IActionsGroups> {
    actions: T;
    creators: TransformActionsGroups<T>;
    mapDispatch: TransformActionsToMaps<T>;
    mapCreators: TransformCreatorsToMaps<T>;
}

let id = 0;
const createdActions: { [key: string]: IActionMeta } = {};

export function createAction(description?: string, from?: string) {
    const action: IExtendAction<{}> = {
        type: `GENERIC_ACTION_${id++}`,
    };
    createdActions[action.type] = { action, description, from };
    return action;
}

export function createPayloadAction<TData>(description?: string, from?: string) {
    const action: IPayloadAction<TData> = {
        type: `GENERIC_ACTION_${id++}`,
        payload: {} as any,
    };
    createdActions[action.type] = { action, description, from };
    return action;
}

export const getActionMeta = ({ type }: IExtendAction<any>): IActionMeta => createdActions[type];
export const getCreators = <T extends IActionsClass>(actions: T): TransformActionsClass<T> => {
    const result: TransformActionsClass<T> = {} as any;
    Object.keys(actions).forEach(action => {
        result[action] = (payload?: any, forComponentId?: string) => ({ ...actions[action] as any, payload, forComponentId });
    });
    return result;
};

export const getActionCreator = (action: Action) => () => action;
export const getPayloadCreator = <TData>(action: IPayloadAction<TData>) => (payload: TData, forComponentId?: string) => ({ ...action, payload, forComponentId });
export const mapToActions = <T extends ActionCreatorsMapObject>(actions: T): { actions: T } => ({ actions });
export const mapDispatchToCreators = <T extends ActionCreatorsMapObject>(actions: { actions: T }) =>
    (dispatch: Dispatch<Action>) => ({ actions: bindActionCreators(actions.actions, dispatch) });

export const prepareActions = <T extends IActionsGroups>(actions: T): IActionsResult<T> => {
    const creators: TransformActionsGroups<T> = {} as any;
    const mapCreators: TransformCreatorsToMaps<T> = {} as any;
    const mapDispatch: TransformActionsToMaps<T> = {} as any;
    Object.keys(actions).forEach(action => {
        creators[action] = getCreators(actions[action]) as any;
        mapCreators[action] = mapToActions(creators[action]);
    });
    Object.keys(actions).forEach(action => {
        mapDispatch[action] = mapDispatchToCreators(mapToActions(creators[action]));
    });
    return { actions, creators, mapDispatch, mapCreators };
};
