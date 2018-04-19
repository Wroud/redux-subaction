"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_redux_1 = require("react-redux");
var action_1 = require("./action");
var config_1 = require("./config");
var tools_1 = require("./tools");
var LocalReducer = (function () {
    function LocalReducer() {
        var _this = this;
        this.reduceComponents = function (state, action) {
            _this.components.forEach(function (component) {
                component.setState(function (prevState, props) { return _this.reducer(props, prevState, action); });
            });
        };
        this.reducer = function (props, state, action) {
            if (typeof state === "function") {
                return state(action);
            }
            if (typeof state !== "object") {
                var _a = action, type = _a.type, payload = _a.payload, fromComponentId = _a.fromComponentId, forComponentId = _a.forComponentId;
                var actionReducer = _this.actionReducerList[type];
                if (!actionReducer) {
                    return state;
                }
                var own = actionReducer.own, reducerFromComponentId = actionReducer.fromComponentId, reducer = actionReducer.reducer;
                if (own && fromComponentId !== props.componentId
                    || reducerFromComponentId && reducerFromComponentId !== props.componentId
                    || forComponentId && forComponentId !== props.componentId) {
                    return state;
                }
                var nextState = reducer(props, state, payload || {}, fromComponentId);
                if (config_1.Logging.level >= config_1.LoggingLevel.info) {
                    console.log("Component: ", props.componentId);
                    _this.logActionInfo(action);
                    console.log("Props / State / Next state: ", props, state, nextState);
                    console.log("---");
                }
                return nextState;
            }
            else {
                var nextState = __assign({}, state);
                var _b = action, type = _b.type, payload = _b.payload, fromComponentId = _b.fromComponentId, forComponentId = _b.forComponentId;
                var actionReducer = _this.actionReducerList[type];
                if (!actionReducer) {
                    return state;
                }
                var own = actionReducer.own, reducerFromComponentId = actionReducer.fromComponentId, reducer = actionReducer.reducer;
                if (own && fromComponentId !== props.componentId
                    || reducerFromComponentId && reducerFromComponentId !== props.componentId
                    || forComponentId && forComponentId !== props.componentId) {
                    return state;
                }
                var diff = reducer(props, nextState, payload || {}, fromComponentId);
                tools_1.deepExtend(nextState, diff);
                if (config_1.Logging.level >= config_1.LoggingLevel.info) {
                    console.log("Component: ", props.componentId);
                    _this.logActionInfo(action);
                    console.log("Props / State / Next state / Diff: ", props, state, nextState, diff);
                    console.log("---");
                }
                return nextState;
            }
        };
        this.handleComponentMount = function (component) {
            _this.components.push(component);
        };
        this.handleComponentUnmount = function (component) {
            var index = _this.components.indexOf(component);
            if (index !== -1) {
                _this.components.splice(index, 1);
            }
        };
        this.actionReducerList = {};
        this.components = [];
    }
    LocalReducer.prototype.on = function (actions, reducer, own, fromComponentId) {
        var _this = this;
        if (Array.isArray(actions)) {
            actions.forEach(function (_a) {
                var type = _a.type;
                _this.actionReducerList[type] = {
                    reducer: reducer,
                    own: own,
                    fromComponentId: fromComponentId,
                };
            });
        }
        else {
            this.actionReducerList[actions.type] = {
                reducer: reducer,
                own: own,
                fromComponentId: fromComponentId,
            };
        }
        return this;
    };
    LocalReducer.prototype.onOwn = function (_a, reducer) {
        var type = _a.type;
        return this.on({ type: type }, reducer, true);
    };
    LocalReducer.prototype.onFrom = function (componentId, _a, reducer) {
        var type = _a.type;
        return this.on({ type: type }, reducer, false, componentId);
    };
    LocalReducer.prototype.logActionInfo = function (action) {
        var _a = action_1.getActionMeta(action), description = _a.description, from = _a.from;
        if (description) {
            console.log((from || "Description") + ": ", description, action);
        }
        else {
            console.log("Action: ", action);
        }
    };
    return LocalReducer;
}());
exports.LocalReducer = LocalReducer;
var localReducers = [];
var componentMaxId = 0;
function resetComponentId() {
    componentMaxId = 0;
}
exports.resetComponentId = resetComponentId;
exports.connectState = function (initState, subscriber, setComponentId) { return function (BaseComponent) {
    var reducer = new LocalReducer();
    subscriber(reducer);
    localReducers.push(reducer);
    var result = (_a = (function (_super) {
            __extends(ConnectState, _super);
            function ConnectState(props) {
                var _this = _super.call(this, props) || this;
                _this.componentId = setComponentId || "component-" + (BaseComponent.displayName || BaseComponent.name) + "-" + componentMaxId++;
                return _this;
            }
            ConnectState.prototype.componentDidMount = function () {
                reducer.handleComponentMount(this.component);
                this.component.setState(initState);
            };
            ConnectState.prototype.componentWillUnmount = function () {
                reducer.handleComponentUnmount(this.component);
            };
            ConnectState.prototype.render = function () {
                var _this = this;
                var props = __assign({}, this.props, { ref: (function (component) { return _this.component = component; }), componentId: this.componentId });
                return React.createElement(BaseComponent, props);
            };
            return ConnectState;
        }(React.Component)),
        _a.displayName = "ConnectState(" + (BaseComponent.displayName || BaseComponent.name) + ")",
        _a);
    return result;
    var _a;
}; };
exports.connectWithComponentId = function (mapStateToProps, mapDispatchToProps, mergeProps) {
    var mapDispatch = function (dispatch, ownProps) {
        var fromComponentId = (!!ownProps && ownProps.componentId !== undefined) ? ownProps.componentId : -1;
        var _dispatch = function (action) { return dispatch((__assign({}, action, { fromComponentId: fromComponentId }))); };
        return mapDispatchToProps(_dispatch, ownProps);
    };
    return react_redux_1.connect(mapStateToProps, mapDispatch, mergeProps);
};
exports.LocalListener = function (state, action) {
    return localReducers.forEach(function (reducer) { return reducer.reduceComponents(state, action); });
};
//# sourceMappingURL=localReducer.js.map