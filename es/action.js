import { bindActionCreators, } from "redux";
let id = 0;
const createdActions = {};
export function createAction(description, from) {
    const action = {
        type: `GENERIC_ACTION_${id++}`,
    };
    createdActions[action.type] = { action, description, from };
    return action;
}
export function createPayloadAction(description, from) {
    const action = {
        type: `GENERIC_ACTION_${id++}`,
        payload: {},
    };
    createdActions[action.type] = { action, description, from };
    return action;
}
export const getActionMeta = ({ type }) => createdActions[type];
export const getCreators = (actions) => {
    const result = {};
    Object.keys(actions).forEach(action => {
        result[action] = (payload, forComponentId) => (Object.assign({}, actions[action], { payload, forComponentId }));
    });
    return result;
};
export const getActionCreator = (action) => () => action;
export const getPayloadCreator = (action) => (payload, forComponentId) => (Object.assign({}, action, { payload, forComponentId }));
export const mapToActions = (actions) => ({ actions });
export const mapDispatchToCreators = (actions) => (dispatch) => ({ actions: bindActionCreators(actions.actions, dispatch) });
export const prepareActions = (actions) => {
    const creators = {};
    const mapCreators = {};
    const mapDispatch = {};
    Object.keys(actions).forEach(action => {
        creators[action] = getCreators(actions[action]);
        mapCreators[action] = mapToActions(creators[action]);
    });
    Object.keys(actions).forEach(action => {
        mapDispatch[action] = mapDispatchToCreators(mapToActions(creators[action]));
    });
    return { actions, creators, mapDispatch, mapCreators };
};
