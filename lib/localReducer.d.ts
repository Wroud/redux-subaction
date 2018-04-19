import * as React from "react";
import { ComponentMergeDecorator, MapDispatchToPropsParam, MapStateToPropsParam, MergeProps } from "react-redux";
import { Action, Reducer } from "redux";
import { IExtendAction } from "./action";
export declare type LocalActionReducer<TProps, TState, TPayload> = (props: TProps, state: TState, payload: TPayload, componentId?: string) => Partial<TState>;
export interface IComponentId {
    componentId: string;
}
export interface ILocalReducer<TProps extends IComponentId, TState> {
    reduceComponents: (state, action: Action) => void;
    reducer: (props: TProps, state: TState, action) => TState;
    handleComponentMount: (component: React.Component<TProps, TState>) => void;
    handleComponentUnmount: (component: React.Component<TProps, TState>) => void;
    on: (<TPayload>(action: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>) => this) | (<TPayload>(actions: Array<IExtendAction<TPayload>>, reducer: LocalActionReducer<TProps, TState, TPayload>) => this);
    onOwn: <TPayload>(action: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>) => this;
    onFrom: <TPayload>(componentId: string, action: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>) => this;
}
export declare class LocalReducer<TProps extends IComponentId, TState> implements ILocalReducer<TProps, TState> {
    private components;
    private actionReducerList;
    constructor();
    reduceComponents: (state: any, action: Action) => void;
    reducer: (props: TProps, state: TState, action: Action) => any;
    on<TPayload>(action: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>, own?: boolean, fromComponentId?: string): any;
    onOwn<TPayload>({type}: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>): any;
    onFrom<TPayload>(componentId: string, {type}: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>): any;
    handleComponentMount: (component: React.Component<TProps, TState, never>) => void;
    handleComponentUnmount: (component: React.Component<TProps, TState, never>) => void;
    private logActionInfo(action);
}
export declare function resetComponentId(): void;
export declare const connectState: <TProps extends {}, TState>(initState: TState, subscriber: (reducer: ILocalReducer<TProps & IComponentId, TState>) => any, setComponentId?: string) => (BaseComponent: React.Component<TProps, TState, never>) => {
    new (props: TProps): {
        component: React.Component<TProps, TState, never>;
        componentId: string;
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): React.ComponentElement<any, React.Component<any, React.ComponentState, never>>;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: TProps) => {} | Pick<{}, K>) | Pick<{}, K>, callback?: () => void): void;
        forceUpdate(callBack?: () => void): void;
        props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<TProps>;
        state: Readonly<{}>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
        shouldComponentUpdate?(nextProps: Readonly<TProps>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<TProps>, prevState: Readonly<{}>): never;
        componentDidUpdate?(prevProps: Readonly<TProps>, prevState: Readonly<{}>, snapshot?: never): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<TProps>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<TProps>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<TProps>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<TProps>, nextState: Readonly<{}>, nextContext: any): void;
    };
    displayName: string;
};
export declare type Connect = <TStateProps, TDispatchProps, TOwnProps extends IComponentId, TMergedProps>(mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps>, mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>, mergeProps?: MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps>) => ComponentMergeDecorator<TMergedProps, TOwnProps>;
export declare const connectWithComponentId: Connect;
export declare const LocalListener: Reducer<any>;
