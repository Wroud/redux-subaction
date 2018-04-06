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
var MainReducerName = "MainReducer";
var SubReducer = (function () {
    function SubReducer(name, initState) {
        var _this = this;
        this.stateSelector = function (state) { return _this.parent.stateSelector(state)[_this._name]; };
        this.setLinkToParent = function (reducer) {
            _this.parent = reducer;
        };
        this.reducer = function (state, action) {
            var nextState = __assign({}, state);
            if (!state) {
                nextState = __assign({}, _this.initState);
            }
            _this.reducers.forEach(function (reducer) {
                nextState[reducer.name] = reducer.reducer(nextState[reducer.name], action);
            });
            _this.subscribers.forEach(function (subscriber) {
                subscriber.handler(nextState, action);
            });
            if (!_this.actionReducerList[action.type]) {
                return nextState;
            }
            var _a = action, type = _a.type, payload = _a.payload;
            var diff = _this.actionReducerList[type](nextState, payload || {});
            _this.deepExtend(nextState, diff);
            console.log("Reducer: ", _this.path);
            _this.logActionInfo(action);
            console.log("State / Next state / Diff: ", state, nextState, diff);
            console.log("---");
            return nextState;
        };
        this.on = function (_a, state) {
            var type = _a.type;
            _this.actionReducerList[type] = state;
            return _this;
        };
        this.join = function (reducer) {
            _this.reducers = _this.reducers.filter(function (el) { return el.name !== reducer.name; });
            reducer.setLinkToParent(_this);
            _this.reducers.push(reducer);
            return _this;
        };
        this.joinReducer = function (name, reducer) {
            _this.reducers = _this.reducers.filter(function (el) { return el.name !== name; });
            _this.reducers.push({ name: name, reducer: reducer });
            return _this;
        };
        this.joinListener = function (name, handler) {
            _this.subscribers = _this.subscribers.filter(function (el) { return el.name !== name; });
            _this.subscribers.push({ name: name, handler: handler });
            return _this;
        };
        this.deepExtend = function (destination, source) {
            if (Array.isArray(destination)) {
                destination.length = 0;
                destination.push.apply(destination, source);
                return;
            }
            for (var property in source) {
                if (typeof source[property] === "object"
                    && source[property] !== null
                    && !Array.isArray(source[property])) {
                    destination[property] = __assign({}, destination[property]) || {};
                    _this.deepExtend(destination[property], source[property]);
                }
                else if (source[property] !== "__delete__") {
                    destination[property] = source[property];
                }
                else {
                    delete destination[property];
                }
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
var MainReducer = (function (_super) {
    __extends(MainReducer, _super);
    function MainReducer(initState) {
        var _this = _super.call(this, MainReducerName, initState) || this;
        _this.stateSelector = function (state) { return state; };
        return _this;
    }
    Object.defineProperty(MainReducer.prototype, "path", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    return MainReducer;
}(SubReducer));
exports.MainReducer = MainReducer;
function createMainReducer(initState) {
    return new MainReducer(initState);
}
exports.createMainReducer = createMainReducer;
function createSubReducer(name, initState) {
    return new SubReducer(name, initState);
}
exports.createSubReducer = createSubReducer;
//# sourceMappingURL=reducer.js.map