import { createStore } from "redux";
import produce from "immer";

let reducer = (state, action) => {
  if (action.type === "login") {
    return { ...state, user: action.user };
  }
  if (action.type === "myID") {
    return { ...state, myID: action.myID };
  }
  if (action.type === "personInTheRoom") {
    return { ...state, personInTheRoom: action.personInTheRoom };
  }
  if (action.type === "logout") {
    return { ...state, user: undefined };
  }
  return state;
};

const store = createStore(
  reducer,
  {
    user: undefined,
    myID: undefined,
    personInTheRoom: undefined,
  },
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
export default store;