import { createContext } from "react";
import { ActionTypes, AppState } from "./app.reducers";

export const StateContext = createContext<
  readonly [AppState, React.Dispatch<ActionTypes>] | null
>(null);
