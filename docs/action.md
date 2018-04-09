## API

### Example
```javascript
import * as React from "react";
import { createStore } from "redux";
import { createRootReducer, createAction, prepareActions } from "redux-subreducer";

var { actions, creators, mapDispatch, mapCreators } = prepareActions({
  drawer: {
    switchDrawer: createAction("Switch Drawer"),
    sendData: createPayloadAction("SendData"),
  },
});

var appReducer =
  createRootReducer()
    .on(actions.drawer.sendData, (state, payload) => ({ data: payload }));

var store = createStore(appReducer.reducer);

var dataToSend = "Redux, SubReducer";
store.dispatch(creators.drawer.sendData(dataToSend));
```
##### `DrawerWraper.jsx`
```js

const initState = {
  open: true,
};
 
export class DrawerWraperClass extends React.Component {
  this.state = initState;
  render() {
    return (
      <Drawer open={this.state.open}>
        ...
      </Drawer>
    );
  }
}
 
const switchDrawer = (props, prevState) => ({ open: !prevState.open });
 
const stateReducer = reducer => reducer
  .on(actions.drawer.switchDrawer, switchDrawer);
 
export const DrawerWrapper = connectState(
  initState,
  stateReducer,
  "drawer", // optional
)(DrawerWraperClass);
```
##### `Layout.jsx`
```js
export class LayoutClass extends React.Component {
  onClick(){
    this.props.actions.drawer.switchDrawer();
  }
  render() {
    return <DrawerWrapper/>;
  }
}
 
export const Layout = connect(null, mapCreators)(LayoutClass);
```

<a id="action"></a>

### `Action`

Contains unique generated `type`, `payload` (if specified). If action dispatched from component with connected loacal store it will be contain `fromComponentId` with `componentId` dispatched from, also contains `forComponentId` (if specified).

```javascript
class Action {
  type;
  payload;
  fromComponentId;
  forComponentId;
}
```

<a id="action-meta"></a>

### `ActionMeta`

Contains `Action`, `description` (if specified) and `from` (if specified)

```javascript
class ActionMeta {
  action;
  description;
  from;
}
```

<a id="createAction"></a>

### `createAction([description], [from])`

Creates `Action` and `ActionMeta` (if `description` and `from` specified)
#### Arguments

* [`description`] \(*string*): Action description will be shown in log if specified
* [`from`] \(*string*): Information about Action source, will be shown in log if specified

  #### Examples

  ```javascript
  import { createAction, getActionMeta } from "redux-subreducer";

  var actions = {
    increment: createAction("Increment"),
    decrement: createAction("Decrement"),
  };
  /*
  actions = {
    increment: { type: "GENERIC_ACTION_0" }
    decrement: { type: "GENERIC_ACTION_1" }
  }
  */
  var incrementMeta = getActionMeta(actions.increment);
  /*
  incrementMeta = {
    action: { type: "GENERIC_ACTION_0" }
    description: "Increment"
  }
  */
  ```
  #### Returns
  >[`Action`](#action)

<a id="createPayloadAction"></a>

### `createPayloadAction<PayloadType = {}>([description], [from])`

[`createAction()`](action.md#createAction) alias, used in typescript
#### Arguments

* <`PayloadType`> \(*type*): Specifies type for payload, used in typescript
* [`description`] \(*string*): Action description will be shown in log if specified
* [`from`] \(*string*): Information about Action source, will be shown in log if specified

  #### Examples

  ```javascript
  import { createPayloadAction, getActionMeta } from "redux-subreducer";

  const typedAction = createPayloadAction<string>("Increment");
  /*
  typedAction = {
    type: "GENERIC_ACTION_0"
  }
  */
  ```
  #### Returns
  >[`Action`](#action)

<a id="getActionMeta"></a>

### `getActionMeta(action)`

Returns stored action meta
#### Arguments

* [`action`] \(*object*): Before [`created`](#createAction) [`Action`](#action)

  #### Returns
  >[`ActionMeta`](#action-meta)

<a id="prepareActions"></a>

### `prepareActions(actionsMap)`

Returns stored action meta
#### Arguments

* [`actionsMap`] \(*object*): map contains actions

  #### Examples
  ```js
  import { createAction, prepareActions } from "redux-subreducer";

  var { actions, creators, mapDispatch, mapCreators } = prepareActions({
    drawer: {
      switchDrawer: createAction("Switch Drawer"),
      sendData: createPayloadAction("SendData"),
    },
  });
  /*
  {
    actions:{
      drawer:{
        switchDrawer: { type: "GENERIC_ACTION_0" },
        sendData: { type: "GENERIC_ACTION_1" },
      }
    },
    creators:{
      drawer:{
        switchDrawer: () => { type: "GENERIC_ACTION_0" },
        sendData: (payload) => { type: "GENERIC_ACTION_1", payload }
      }
    },
    mapCreators:{
      actions:{
        drawer:{
          switchDrawer: () => { type: "GENERIC_ACTION_0" },
          sendData: (payload) => { type: "GENERIC_ACTION_1", payload }
        }
      }
    },
    mapDispatch: /*passes mapCreators to connect()*/
  */
  ```
  #### Returns
  >`{ actions, creators, mapDispatch, mapCreators }`
