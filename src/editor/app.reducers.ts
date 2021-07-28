import { Reducer } from "react";
import { InterfaceScreen } from "./app.types";
import { ensureNever } from "../utils/actions";
import { createNewScreenId } from "../utils/screens";
import { AppActionTypes } from "./app.actions";

import {
  StageState,
  reducer as stageReducer,
  initialStageState,
  StageActionTypes,
} from "./stage";

export type AppState = {
  mode: "empty" | "edit" | "preview";
  selectedScreen: InterfaceScreen | null;
  stage: StageState;
};

export const initialAppState: AppState = {
  mode: "empty",
  selectedScreen: null,
  stage: initialStageState,
};

export type ActionTypes = AppActionTypes | StageActionTypes;

export const reducer: Reducer<AppState, ActionTypes> = (state, action) => {
  console.log("ACTION:", action, "STATE:", state);
  let res: AppState;
  switch (action.type) {
    case "app/screen/image/change":
      res = {
        ...state,
        selectedScreen: state.selectedScreen && {
          ...state.selectedScreen,
          backgroundImage: action.payload,
        },
      };
      return res;
    case "app/screen/mask/change":
      res = {
        ...state,
        selectedScreen: state.selectedScreen && {
          ...state.selectedScreen,
          maskImage: action.payload,
        },
      };
      return res;
    case "app/screen/name/change":
      res = {
        ...state,
        selectedScreen: state.selectedScreen && {
          ...state.selectedScreen,
          name: action.payload,
        },
      };
      return res;
    case "app/screen/name/clear":
      res = {
        ...state,
        selectedScreen: state.selectedScreen && {
          ...state.selectedScreen,
          name: "",
        },
      };
      return res;
    case "app/screen/image/clear":
      res = {
        ...state,
        selectedScreen: state.selectedScreen && {
          ...state.selectedScreen,
          backgroundImage: undefined,
        },
      };
      return res;
    case "app/screen/mask/clear":
      res = {
        ...state,
        selectedScreen: state.selectedScreen && {
          ...state.selectedScreen,
          maskImage: undefined,
        },
      };
      return res;
    case "app/screen/create":
      res = {
        ...state,
        mode: "edit",
        selectedScreen: {
          type: "screen",
          screenId: createNewScreenId(),
          name: "",
          areas: [],
        },
      };
      return res;
    case "stage/idle/line/start":
    case "stage/drawing/line/end":
    case "stage/drawing/area/clear":
    case "stage/drawing/line/clear":
    case "stage/drawing/area/select":
    case "stage/drawing/area/deselect":
      res = {
        ...state,
        stage: stageReducer(state.stage, action),
      };
      return res;

    case "stage/drawing/area/delete":
      res = {
        ...state,
        selectedScreen: state.selectedScreen && {
          ...state.selectedScreen,
          areas:
            state?.selectedScreen?.areas.filter(
              (area) => area !== state.stage.selectedArea
            ) || [],
        },
        stage: stageReducer(state.stage, action),
      };
      return res;
    case "stage/drawing/area/change":
      const area = { ...state.stage.selectedArea, ...action.payload };
      res = {
        ...state,
        selectedScreen: state.selectedScreen && {
          ...state.selectedScreen,
          areas: [
            ...(state?.selectedScreen?.areas.filter(
              (a) => a !== state.stage.selectedArea
            ) ?? []),
            area,
          ],
        },
        stage: stageReducer(state.stage, { ...action, payload: area }),
      };
      return res;
    case "stage/drawing/area/add":
      res = {
        ...state,
        selectedScreen: state.selectedScreen && {
          ...state.selectedScreen,
          areas: [
            ...(state?.selectedScreen?.areas ?? []),
            ...(state.stage.drawingArea ? [state.stage.drawingArea] : []),
          ],
        },
        stage: stageReducer(state.stage, action),
      };
      return res;
    default:
      ensureNever(action);
      return state;
  }
};
