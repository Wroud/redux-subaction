## API

### Example
```javascript
import { createStore } from "redux";
import { createSubReducer, createMainReducer } from "redux-subreducer";

var subReducer = 
  createSubReducer("subtree")
    .on({type: "SOME_ACTION"}, (state, payload) => ({ message: "Hello " + payload }));
var appReducer =
  createMainReducer()
    .join(subReducer)
    .on({type: "SOME_ACTION"}, (state, payload) => ({ message: "Hello " + payload }));

var store = createStore(appReducer.reducer);

store.dispatch({ type: "SOME_ACTION", payload: "World!"});

/*
{
  subtree:{
    message: "Hello World!"
  },
  message: "Hello World!"
}
*/
```

<a id="sub-reducer"></a>

### `SubReducer`

SubReducer it's a class thats give acces to some additional functions to help build complicated reducers.

```javascript
export interface SubReducer {
  name;
  constructor(name, initState);

  reducer(state, action);
  stateSelector(state);
  on(action, reducer);
  join(reducer);
  joinReducer(name, reducer);
  joinListener(name, handler);
}
```

<a id="sub-reducer-constructor"></a>

### `SubReducer(name, [initState])`

Initialize SubReducer class with given `name` (key) and `[initState]`

<a id="sub-reducer-arguments"></a>

#### Arguments

* `name` \(*string*): That argument is key in state object. 
* [`initState`] \(*any*): The initial state. You may optionally specify it to hydrate the state from the server in universal apps, or to restore a previously serialized user session. If you `join` another reducer, this must be a plain object with the same shape as the keys passed to it. Otherwise, you are free to pass anything that your reducer can understand.

#### Examples
```javascript
var counterReducer = createSubReducer("counter");
var appReducer =
  createMainReducer()
    .join(counterReducer);
```
will control `counter` subtree in app state 
```javascript
{
  counter: {/*state controlled by counerReducer*/}
}
```
more complain example:
```javascript
var counterReducer = createSubReducer("counter");
var homeReducer = 
  createSubReducer("home")
    .join(counterReducer);
var appReducer =
  createMainReducer()
    .join(homeReducer);
```
`homeReducer` will control `home` subtree in app state

`counterReducer` will control `counter` subtree in `home` state
```javascript
{
  home:{
    counter: {/*state controlled by counerReducer*/}
  }
}
```
#### Returns

`SubReducer` : Object that holds functions to manage subreducer, `join` reducers, `on` add per-action reducers, `stateSelector` select state controlled by reducer from app state, `reducer` getting reducer for connecting with redux.

<a id="sub-reducer-stateSelector"></a>

### `stateSelector(state)`

Select subreducer controlled state from app store

<a id="sub-reducer-stateSelector-arguments"></a>

#### Arguments

* [`state`] \(*any*): The state that you can get from `store.getState()`

#### Examples
```javascript
var counterReducer = createSubReducer("counter");
var appReducer =
  createMainReducer()
    .join(counterReducer);

var store = createStore(appReducer.reducer);
var counterState = counterReducer.stateSelector(store.getState());
// its same as store.getState().counter
```
```javascript
var counterReducer = createSubReducer("counter");
var homeReducer = createSubReducer("home")
    .join(counterReducer);
var appReducer =
  createMainReducer()
    .join(homeReducer);

var store = createStore(appReducer.reducer);
var homeState = homeState.stateSelector(store.getState());
// its same as store.getState().home
var counterState = counterReducer.stateSelector(store.getState());
// its same as store.getState().home.counter
```

<a id="sub-reducer-on"></a>

### `on(action, reducer)`

Set reducer for action, you cant set only one reducer per action

<a id="sub-reducer-on-arguments"></a>

#### Arguments

* [`action`] \(*any redux action*): Any redux action, or action created with `createAction()` or `createPayloadAction()`
* [`reducer`] \(*function(state, [payload])*): Function that get `state` and `payload` (*if action have*) arguments, must return object to update state immutable.

#### Example
```javascript
import { createAction, createPayloadAction, createSubReducer, createMainReducer } from "redux-subreducer";

var appReducer =
  createMainReducer()
    .on({ type: "SOME_ACTION" }, (state, payload) => ({ payload }))
    .on(increment, state => ({ count: state.count || 0 + 1 }))
    .on(payloadAction, (state, payload) => ({ payload }));
  
dispatch({ type: "SOME_ACTION", payload: "Hello"});

/*
{
    payload: "Hello"
}
*/

dispatch(increment);
/*
{
    payload: "Hello",
    count: 1
}
*/
 
dispatch({ ...payloadAction, payload: "Hello world"});
/*
{
  payload: "Hello world",
  count: 1
}
*/
```
```javascript
var state = { 
  home: { 
    count: 1,
    drawer: { isOpen: true }
  },
  dashboard: {
    isChangesSaved: true
  }
};
  
var appReducer =
  createMainReducer()
    .on(increment, state => (
      { 
        home:{
          count: state.home.count + 1 
        }
      }));

  dispatch(increment);
  /**
   * {
   *    home: {
   *      count: 2,
   *      drawer: { isOpen: true }
   *    },
   *    dashboard: {
   *      isChangesSaved: true
   *    }
   * }
   */
   if(oldState === newState) {} // false
   if(oldState.home === newState.home) {} // false
   if(oldState.home.drawer === newState.home.drawer) {} // true
   if(oldState.dashboard === newState.dashboard) {} // true
  ```

<a id="sub-reducer-join"></a>

### `join(reducer)`

Join subreducer to another. If subreducer with same name already joined, it will be unjoined before joining new.

<a id="sub-reducer-join-arguments"></a>

#### Arguments

* [`reducer`] \(*SubReducer*): Any aren't joined before SubReducer

##### Example
```javascript
var counterReducer = createSubReducer("counter");
var homeReducer = 
  createSubReducer("home")
    .join(counterReducer);

var appReducer =
  createMainReducer()
    .join(homeReducer);
```
```javascript
var counterReducer = createSubReducer("counter");
var anotherCounterReducer = createSubReducer("counter");

var appReducer =
  createMainReducer()
    .join(counterReducer);

/*...*/

appReducer.join(anotherCounterReducer);
// unjoin counterReducer and join anotherCounterReducer
```

<a id="sub-reducer-joinListener"></a>

### `joinListener(name, listener)`

Join Listener to reducer, that listen all actions. If listener with same name already joined, it will be unjoined before joining new.

<a id="sub-reducer-joinListener-arguments"></a>

#### Arguments

* [`name`] \(*string*): any string
* [`listener`] \(*function(state, action)*): Function that get `state` and `action` arguments.

##### Example
```javascript
var appReducer =
  createMainReducer()
      .joinListener("some listener", (state, action)=>{
        console.log("Get action: ", action.type);
      });
```
```javascript
var listener = (state, action)=>{
  console.log("First listener");
  console.log("Get action: ", action.type);
});
var anotherListener = (state, action)=>{
  console.log("Second listener");
  console.log("Get action: ", action.type);
});
var appReducer =
  createMainReducer()
    .joinListener("listener", listener);
/*...*/
appReducer.join(anotherListener);
// unjoin listener and join anotherListener
```

<a id="sub-reducer-joinReducer"></a>

### `joinReducer(name, reducer)`

Join reducer to subreducer. If reducer with same name already joined, it will be unjoined before joining new.

<a id="sub-reducer-joinReducer-arguments"></a>

#### Arguments

* [`name`] \(*string*): That argument is key in state object. Same as `SubReducer` `name` argument
* [`reducer`] \(*SubReducer*): Any aren't joined before SubReducer

```javascript
import { routerReducer } from "react-router-redux";

var appReducer =
  createMainReducer()
    .joinReducer("routing", routerReducer);

/* state object will be look like this:
{
  ...
  routing: {}
}
*/
```
```javascript
var counterReducer = (state, action) => {
  return 0;
};
var anotherCounterReducer = (state, action) => {
  return 1;
};

var appReducer =
  createMainReducer()
      .joinReducer("counter", counterReducer);
/*...*/
appReducer.joinReducer("counter", anotherCounterReducer);
// unjoin counterReducer and join anotherCounterReducer
```
