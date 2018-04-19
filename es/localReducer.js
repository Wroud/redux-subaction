import * as React from "react";
import { connect } from "react-redux";
import { getActionMeta } from "./action";
import { Logging, LoggingLevel } from "./config";
import { deepExtend } from "./tools";
export class LocalReducer {
    constructor() {
        this.reduceComponents = (state, action) => {
            this.components.forEach(component => {
                component.setState((prevState, props) => this.reducer(props, prevState, action));
            });
        };
        this.reducer = (props, state, action) => {
            if (typeof state === "function") {
                return state(action);
            }
            if (typeof state !== "object") {
                const { type, payload, fromComponentId, forComponentId } = action;
                const actionReducer = this.actionReducerList[type];
                if (!actionReducer) {
                    return state;
                }
                const { own, fromComponentId: reducerFromComponentId, reducer } = actionReducer;
                if (own && fromComponentId !== props.componentId
                    || reducerFromComponentId && reducerFromComponentId !== props.componentId
                    || forComponentId && forComponentId !== props.componentId) {
                    return state;
                }
                const nextState = reducer(props, state, payload || {}, fromComponentId);
                if (Logging.level >= LoggingLevel.info) {
                    console.log("Component: ", props.componentId);
                    this.logActionInfo(action);
                    console.log("Props / State / Next state: ", props, state, nextState);
                    console.log("---");
                }
                return nextState;
            }
            else {
                const nextState = Object.assign({}, state);
                const { type, payload, fromComponentId, forComponentId } = action;
                const actionReducer = this.actionReducerList[type];
                if (!actionReducer) {
                    return state;
                }
                const { own, fromComponentId: reducerFromComponentId, reducer } = actionReducer;
                if (own && fromComponentId !== props.componentId
                    || reducerFromComponentId && reducerFromComponentId !== props.componentId
                    || forComponentId && forComponentId !== props.componentId) {
                    return state;
                }
                const diff = reducer(props, nextState, payload || {}, fromComponentId);
                deepExtend(nextState, diff);
                if (Logging.level >= LoggingLevel.info) {
                    console.log("Component: ", props.componentId);
                    this.logActionInfo(action);
                    console.log("Props / State / Next state / Diff: ", props, state, nextState, diff);
                    console.log("---");
                }
                return nextState;
            }
        };
        this.handleComponentMount = (component) => {
            this.components.push(component);
        };
        this.handleComponentUnmount = (component) => {
            const index = this.components.indexOf(component);
            if (index !== -1) {
                this.components.splice(index, 1);
            }
        };
        this.actionReducerList = {};
        this.components = [];
    }
    on(actions, reducer, own, fromComponentId) {
        if (Array.isArray(actions)) {
            actions.forEach(({ type }) => {
                this.actionReducerList[type] = {
                    reducer,
                    own,
                    fromComponentId,
                };
            });
        }
        else {
            this.actionReducerList[actions.type] = {
                reducer,
                own,
                fromComponentId,
            };
        }
        return this;
    }
    onOwn({ type }, reducer) {
        return this.on({ type }, reducer, true);
    }
    onFrom(componentId, { type }, reducer) {
        return this.on({ type }, reducer, false, componentId);
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
const localReducers = [];
let componentMaxId = 0;
export function resetComponentId() {
    componentMaxId = 0;
}
export const connectState = (initState, subscriber, setComponentId) => (BaseComponent) => {
    const reducer = new LocalReducer();
    subscriber(reducer);
    localReducers.push(reducer);
    const result = (_a = class ConnectState extends React.Component {
            constructor(props) {
                super(props);
                this.componentId = setComponentId || `component-${BaseComponent.displayName || BaseComponent.name}-${componentMaxId++}`;
            }
            componentDidMount() {
                reducer.handleComponentMount(this.component);
                this.component.setState(initState);
            }
            componentWillUnmount() {
                reducer.handleComponentUnmount(this.component);
            }
            render() {
                const props = Object.assign({}, this.props, { ref: (component => this.component = component), componentId: this.componentId });
                return React.createElement(BaseComponent, props);
            }
        },
        _a.displayName = `ConnectState(${BaseComponent.displayName || BaseComponent.name})`,
        _a);
    return result;
    var _a;
};
export const connectWithComponentId = (mapStateToProps, mapDispatchToProps, mergeProps) => {
    const mapDispatch = (dispatch, ownProps) => {
        const fromComponentId = (!!ownProps && ownProps.componentId !== undefined) ? ownProps.componentId : -1;
        const _dispatch = (action) => dispatch((Object.assign({}, action, { fromComponentId })));
        return mapDispatchToProps(_dispatch, ownProps);
    };
    return connect(mapStateToProps, mapDispatch, mergeProps);
};
export const LocalListener = (state, action) => localReducers.forEach(reducer => reducer.reduceComponents(state, action));
