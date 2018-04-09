## API

### Example
```javascript
import { createStore } from "redux";
import { createSubReducer, createRootReducer } from "redux-subreducer";

var subReducer = 
  createSubReducer("subtree")
    .on({type: "SOME_ACTION"}, (state, payload) => ({ message: "Hello " + payload }));
var appReducer =
  createRootReducer()
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