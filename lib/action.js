"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
var id = 0;
var createdActions = {};
function createAction(description, from) {
    var action = {
        type: "GENERIC_ACTION_" + id++,
    };
    createdActions[action.type] = { action: action, description: description, from: from };
    return action;
}
exports.createAction = createAction;
function createPayloadAction(description, from) {
    var action = {
        type: "GENERIC_ACTION_" + id++,
        payload: {},
    };
    createdActions[action.type] = { action: action, description: description, from: from };
    return action;
}
exports.createPayloadAction = createPayloadAction;
exports.getActionMeta = function (_a) {
    var type = _a.type;
    return createdActions[type];
};
exports.getCreators = function (actions) {
    var result = {};
    Object.keys(actions).forEach(function (action) {
        result[action] = function (payload, forComponentId) { return (__assign({}, actions[action], { payload: payload, forComponentId: forComponentId })); };
    });
    return result;
};
exports.getActionCreator = function (action) { return function (forComponentId) { return (__assign({}, action, { forComponentId: forComponentId })); }; };
exports.getPayloadCreator = function (action) { return function (payload, forComponentId) { return (__assign({}, action, { payload: payload, forComponentId: forComponentId })); }; };
exports.mapToActions = function (actions) { return ({ actions: actions }); };
exports.mapDispatchToCreators = function (actions) {
    return function (dispatch) { return ({ actions: redux_1.bindActionCreators(actions.actions, dispatch) }); };
};
exports.prepareActions = function (actions) {
    var creators = {};
    var mapCreators = {};
    var mapDispatch = {};
    Object.keys(actions).forEach(function (action) {
        creators[action] = exports.getCreators(actions[action]);
        mapCreators[action] = exports.mapToActions(creators[action]);
    });
    Object.keys(actions).forEach(function (action) {
        mapDispatch[action] = exports.mapDispatchToCreators(exports.mapToActions(creators[action]));
    });
    return { actions: actions, creators: creators, mapDispatch: mapDispatch, mapCreators: mapCreators };
};
//# sourceMappingURL=action.js.map