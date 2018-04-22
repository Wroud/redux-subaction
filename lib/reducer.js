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
var action_1 = require("./action");
var config_1 = require("./config");
var tools_1 = require("./tools");
var RootReducerName = "@root";
var SubReducer = (function () {
    function SubReducer(name, initState) {
        var _this = this;
        this.stateSelector = function (state) { return _this.parent.stateSelector(state)[_this._name]; };
        this.setParent = function (reducer) {
            _this.parent = reducer;
        };
        this.reducer = function (state, action) {
            _this.subscribers.forEach(function (subscriber) {
                subscriber.handler(state, action);
            });
            if (typeof state === "function") {
                return state(action);
            }
            if (typeof state !== "object" && typeof _this.initState !== "object") {
                var _a = action, type = _a.type, payload = _a.payload;
                var actionReducer = _this.actionReducerList[type];
                var nextState = __assign({}, state);
                if (state === undefined) {
                    nextState = _this.initState;
                }
                if (!actionReducer) {
                    return nextState;
                }
                nextState = actionReducer(state, payload || {});
                if (config_1.Logging.level >= config_1.LoggingLevel.info) {
                    console.log("Reducer: ", _this.path);
                    _this.logActionInfo(action);
                    console.log("State / Next state / Diff: ", state, nextState);
                    console.log("---");
                }
                return nextState;
            }
            else {
                var nextState_1 = __assign({}, state);
                if (!state) {
                    nextState_1 = __assign({}, _this.initState);
                }
                _this.reducers.forEach(function (reducer) {
                    nextState_1[reducer.name] = reducer.reducer(nextState_1[reducer.name], action);
                });
                var _b = action, type = _b.type, payload = _b.payload;
                var actionReducer = _this.actionReducerList[type];
                if (!actionReducer) {
                    return nextState_1;
                }
                var diff = actionReducer(nextState_1, payload || {});
                tools_1.deepExtend(nextState_1, diff);
                if (config_1.Logging.level >= config_1.LoggingLevel.info) {
                    console.log("Reducer: ", _this.path);
                    _this.logActionInfo(action);
                    console.log("State / Next state / Diff: ", state, nextState_1, diff);
                    console.log("---");
                }
                return nextState_1;
            }
        };
        this.initState = initState || {};
        this.actionReducerList = {};
        this.reducers = [];
        this.subscribers = [];
        this._name = name;
    }
    Object.defineProperty(SubReducer.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubReducer.prototype, "path", {
        get: function () {
            return this.parent.path + "." + this._name;
        },
        enumerable: true,
        configurable: true
    });
    SubReducer.prototype.on = function (actions, reducer) {
        var _this = this;
        if (Array.isArray(actions)) {
            actions.forEach(function (_a) {
                var type = _a.type;
                _this.actionReducerList[type] = reducer;
            });
        }
        else {
            this.actionReducerList[actions.type] = reducer;
        }
        return this;
    };
    SubReducer.prototype.join = function (reducer) {
        this.reducers = this.reducers.filter(function (el) { return el.name !== reducer.name; });
        reducer.setParent(this);
        this.reducers.push(reducer);
        return this;
    };
    SubReducer.prototype.joinReducer = function (name, reducer) {
        this.reducers = this.reducers.filter(function (el) { return el.name !== name; });
        this.reducers.push({ name: name, reducer: reducer, initState: {} });
        return this;
    };
    SubReducer.prototype.joinListener = function (name, handler) {
        this.subscribers = this.subscribers.filter(function (el) { return el.name !== name; });
        this.subscribers.push({ name: name, handler: handler });
        return this;
    };
    SubReducer.prototype.logActionInfo = function (action) {
        var _a = action_1.getActionMeta(action), description = _a.description, from = _a.from;
        if (description) {
            console.log((from || "Description") + ": ", description, action);
        }
        else {
            console.log("Action: ", action);
        }
    };
    return SubReducer;
}());
exports.SubReducer = SubReducer;
var RootReducer = (function (_super) {
    __extends(RootReducer, _super);
    function RootReducer(initState) {
        var _this = _super.call(this, RootReducerName, initState) || this;
        _this.stateSelector = function (state) { return state; };
        return _this;
    }
    Object.defineProperty(RootReducer.prototype, "path", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    return RootReducer;
}(SubReducer));
exports.RootReducer = RootReducer;
function getState(reducers, map) {
    return function (state) {
        var stateMap = {};
        Object.keys(reducers).forEach(function (key) {
            stateMap[key] = reducers[key].stateSelector(state);
        });
        return map(stateMap);
    };
}
exports.getState = getState;
function createRootReducer(initState) {
    return new RootReducer(initState);
}
exports.createRootReducer = createRootReducer;
function createSubReducer(name, initState) {
    return new SubReducer(name, initState);
}
exports.createSubReducer = createSubReducer;
//# sourceMappingURL=reducer.js.map