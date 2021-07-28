import { Reducer } from "react";
import { PolygonLine, SelectableArea } from "../app.types";
import { createNewAreaId } from "../../utils/screens";
import { StageActionTypes } from "./stage.actions";
import { ensureNever } from "../../utils/actions";

export type StageState = {
  status: "idle" | "drawing" | "area-selected";
  drawingLine: PolygonLine | null;
  drawingArea: SelectableArea | null;
  selectedArea: SelectableArea | null;
};

export const initialStageState: StageState = {
  status: "idle",
  drawingLine: null,
  drawingArea: null,
  selectedArea: null,
};

export const reducer: Reducer<StageState, StageActionTypes> = (
  stage,
  action
) => {
  switch (action.type) {
    case "stage/idle/line/start":
      return {
        ...stage,
        status: "drawing",
        selectedArea: null,
        drawingLine: {
          type: "line",
          start: action.payload,
        },
      };
    case "stage/drawing/line/end":
      const baseArea: StageState["drawingArea"] = stage.drawingArea ?? {
        type: "area",
        id: createNewAreaId(),
        name: "",
        rolloverMask: false,
        link: "",
        fillColor: "red",
        fillOpacity: "10%",
        stroke: "lightgrey",
        lines: [],
      };
      const line = stage.drawingLine && {
        ...stage.drawingLine,
        end: action.payload,
      };
      const res: StageState = {
        ...stage,
        status: "drawing",
        drawingLine: {
          type: "line",
          start: action.payload,
        },
        drawingArea: {
          ...baseArea,
          lines: [...baseArea.lines, ...(line ? [line] : [])],
        },
      };
      return res;
    case "stage/drawing/area/add":
      return {
        ...stage,
        status: "idle",
        drawingLine: null,
        drawingArea: null,
      };
    case "stage/drawing/area/select":
      return {
        ...stage,
        selectedArea: action.payload,
      };
    case "stage/drawing/area/delete":
    case "stage/drawing/area/deselect":
      return {
        ...stage,
        selectedArea: null,
      };
    case "stage/drawing/area/change":
      return {
        ...stage,
        selectedArea: action.payload,
      };
    case "stage/drawing/line/clear":
    case "stage/drawing/area/clear":
      return {
        ...stage,
        status: "idle",
        drawingLine: null,
        drawingArea: null,
      };
    default:
      ensureNever(action);
      return stage;
  }
};
