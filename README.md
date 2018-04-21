# redux-subreducer

Redux-Subreducer can do:
1. deep state tree control
2. component local state control

Also provides detailed logging.
More completed example:
1. https://github.com/Wroud/ScheduleReact



[![Travis](https://img.shields.io/travis/Wroud/redux-subreducer.svg)](https://travis-ci.org/Wroud/redux-subreducer)
[![GitHub issues](https://img.shields.io/github/issues/Wroud/redux-subreducer.svg)](https://github.com/Wroud/redux-subreducer/issues)
[![GitHub license](https://img.shields.io/github/license/Wroud/redux-subreducer.svg)](https://github.com/Wroud/redux-subreducer/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/redux-subreducer.svg?style=flat-square)](https://www.npmjs.com/package/redux-subreducer)
[![npm downloads](https://img.shields.io/npm/dm/redux-subreducer.svg?style=flat-square)](https://www.npmjs.com/package/redux-subreducer)


## Install
```
npm install --save redux-subreducer react react-redux
```

## Documentation

* [API Reference examples](docs/README.md)
* [API Reference](https://wroud.github.io/redux-subreducer/dist/docs/)

## Connect sub-reducer to redux
**1. Create sub reducer for `counter`**
```javascript
import { createAction, createRootReducer, LocalListener } from "redux-subreducer";

export const actions = {
    increment: createAction("Increment"),
    decrement: createAction("Decrement"),
};

const initalState = 0;

export const counterReducer =
    createSubReducer("counter", initalState)
        .on(actions.increment, state => state + 1)
        .on(actions.decrement, state => state - 1);
```
**2. Then create main reducer**
```javascript
import { routerReducer } from "react-router-redux";

const appInitalState = {};

export const appReducer =
    createRootReducer(appInitalState)
        .join(counterReducer)
        .joinReducer("routing", routerReducer) // also you can connect classic reducers
        .joinListener("listener", LocalListener); // or actions listener, its same reducer but not returning state
```
**3. Now create redux store**
```javascript
import { createStore } from "redux";

const store = createStore(appReducer.reducer, appInitalState);
/*
    {
        counter: 0,
        routing: {...}
    }
*/
```
**4. Dispatch actions!**
```javascript
store.dispatch(actions.increment);
/*
    {
        counter: 1,
        routing: {...}
    }
*/
store.dispatch(actions.decrement);
/*
    {
        counter: 0,
        routing: {...}
    }
*/
```

![Console log](https://i.imgur.com/BtB3wYJ.png)
## Connect component local store to `LocalReducer`
Since we connected `LocalListener` (step 2) we can connect React Component local store to `LocalReducer`

**1. Lets create one more action**
```javascript
export const switchDrawerAction = createAction("Switch Drawer");
```
**Layout.jsx**
```javascript
export class LayoutClass extends React.Component {
    render() {
        return 
            (
                <NavMenu switchDrawer={this.props.switchDrawer} />
            );
    }
}

function mapDispatchToProps(dispatch) {
  return {
    switchDrawer: () => dispatch(switchDrawerAction)
  }
}

export const Layout = connect(null, mapDispatchToProps)(LayoutClass);
```
**DrawerWraper.jsx**
```javascript
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
    .on(switchDrawerAction, switchDrawer);


export const DrawerWrapper = connectState(
        initState,
        stateReducer,
        "drawer", // optional
    )(DrawerWraperClass);
```
**2. It works.**
![Console log](https://i.imgur.com/BE9EQXu.png)
