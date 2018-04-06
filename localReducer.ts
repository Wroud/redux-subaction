import * as React from "react";
import { ComponentMergeDecorator, connect, Dispatch, MapDispatchToPropsParam, MapStateToPropsParam, MergeProps } from "react-redux";
import { Reducer } from "redux";
import { getActionMeta, IExtendAction } from "./action";

type LocalActionReducer<TProps, TState, TPayload> = (props: TProps, state: TState, payload: TPayload, componentId?: string) => Partial<TState>;

export interface IComponentId {
    componentId: string;
}

interface ILocalActionList<TProps, TState> {
    [key: string]: ILocalAction<TProps, TState, any>;
}

interface ILocalAction<TProps, TState, TPayload> {
    own?: boolean;
    fromComponentId?: string;
    forComponentId?: string;
    reducer: LocalActionReducer<TProps, TState, TPayload>;
}

export interface ILocalReducer<TProps extends IComponentId, TState> {
    components: Array<React.Component<TProps, TState>>;

    reducer: (props: TProps, state: TState, action) => TState;
    handleComponentMount: (component: React.Component<TProps, TState>) => void;
    handleComponentUnmount: (component: React.Component<TProps, TState>) => void;

    on: <TPayload>(action: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>) => this;
    onOwn: <TPayload>(action: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>) => this;
    onFrom: <TPayload>(componentId: string, action: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>) => this;
}

export class LocalReducer<TProps extends IComponentId, TState>
    implements ILocalReducer<TProps, TState> {

    components: Array<React.Component<TProps, TState>>;
    private actionReducerList: ILocalActionList<TProps, TState>;

    constructor() {
        this.actionReducerList = {} as any;
        this.components = [];
    }

    reducer = (props: TProps, state: TState, action) => {
        const nextState: TState = { ...state as any };

        if (!this.actionReducerList[action.type]) {
            // this.logActionInfo(action);
            return nextState;
        }

        const { type, payload, fromComponentId, forComponentId } = action as IExtendAction<any>;
        const { own, fromComponentId: reducerFromComponentId, reducer } = this.actionReducerList[type];
        if (own && fromComponentId !== props.componentId
            || reducerFromComponentId && reducerFromComponentId !== props.componentId
            || forComponentId && forComponentId !== props.componentId) {
            return nextState;
        }

        const diff = reducer(props, nextState, payload || {}, fromComponentId);
        this.deepExtend(nextState, diff);

        console.log("Component: ", props.componentId);
        this.logActionInfo(action);
        console.log("Props / State / Next state / Diff: ", props, state, nextState, diff);
        console.log("---");

        return nextState;
    }

    on = <TPayload>({ type }: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>, own?: boolean, fromComponentId?: string) => {
        this.actionReducerList[type] = {
            reducer,
            own,
            fromComponentId,
        };
        return this;
    }

    onOwn = <TPayload>({ type }: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>) => {
        return this.on({ type }, reducer, true);
    }

    onFrom = <TPayload>(componentId: string, { type }: IExtendAction<TPayload>, reducer: LocalActionReducer<TProps, TState, TPayload>) => {
        return this.on({ type }, reducer, false, componentId);
    }

    handleComponentMount = (component: React.Component<TProps, TState>) => {
        this.components.push(component);
    }
    handleComponentUnmount = (component: React.Component<TProps, TState>) => {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
        }
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

const localReducers: Array<ILocalReducer<any, any>> = [];
let componentMaxId = 0;

export const connectState = <TProps extends {}, TState>
    (
    initState: TState,
    subscriber: (reducer: ILocalReducer<TProps & IComponentId, TState>) => any,
    setComponentId?: string) =>
    (BaseComponent: React.Component<TProps, TState>) => {
        const reducer = new LocalReducer<TProps & IComponentId, TState>();
        subscriber(reducer);
        localReducers.push(reducer as ILocalReducer<TProps & IComponentId, TState>);

        const result = class ConnectState extends React.Component<TProps> {
            static displayName = `ConnectState(${(BaseComponent as any).displayName || (BaseComponent as any).name})`;
            private component!: typeof BaseComponent;
            private componentId: string;

            constructor(props: TProps) {
                super(props);
                this.componentId = setComponentId || `component-${(BaseComponent as any).displayName || (BaseComponent as any).name}-${componentMaxId++}`;
            }

            componentDidMount() {
                reducer.handleComponentMount(this.component as React.Component<TProps & IComponentId, TState>);
                this.component.setState(initState);
            }

            componentWillUnmount() {
                reducer.handleComponentUnmount(this.component as React.Component<TProps & IComponentId, TState>);
            }

            render() {
                const props = {
                    ...(this.props as any),
                    ref: (component => this.component = component),
                    componentId: this.componentId,
                };
                return React.createElement(BaseComponent as any, props);
            }
        };

        return result;
    };

type Connect = <TStateProps, TDispatchProps, TOwnProps extends IComponentId, TMergedProps>(
    mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps>,
    mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
    mergeProps?: MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps>,
) => ComponentMergeDecorator<TMergedProps, TOwnProps>;

export const connectWithComponentId: Connect = (mapStateToProps, mapDispatchToProps, mergeProps) => {
    const mapDispatch = (dispatch: Dispatch<any>, ownProps?) => {
        const fromComponentId = (!!ownProps && ownProps.componentId !== undefined) ? ownProps.componentId : -1;
        const _dispatch = (action: any) => dispatch(({ ...action, fromComponentId }));
        return (mapDispatchToProps as any)(_dispatch, ownProps);
    };
    return connect(mapStateToProps, mapDispatch, mergeProps as any);
};

export const LocalListener: Reducer<any> = (state, action) => {
    localReducers.forEach(reducer => {
        reducer.components.forEach(component => {
            component.setState((prevState, props) => reducer.reducer(props, prevState, action));
        });
    });
};
