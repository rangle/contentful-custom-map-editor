import { Coordinates, SelectableArea } from "../app.types";
import { Action, ExportActionTypes, payload } from "../../utils/actions";

const startLine = Action("stage/idle/line/start", payload<Coordinates>());
const endLine = Action("stage/drawing/line/end", payload<Coordinates>());
const clearLine = Action("stage/drawing/line/clear", payload<void>());

const addArea = Action("stage/drawing/area/add", payload<void>());
const selectArea = Action(
  "stage/drawing/area/select",
  payload<SelectableArea>()
);
const clearAreaSelection = Action(
  "stage/drawing/area/deselect",
  payload<void>()
);
const clearArea = Action("stage/drawing/area/clear", payload<void>());

const changeSelectedArea = Action(
  "stage/drawing/area/change",
  payload<SelectableArea>()
);

const deleteSelectedArea = Action("stage/drawing/area/delete", payload<void>());

export const StageActions = {
  startLine,
  endLine,
  clearLine,
  addArea,
  selectArea,
  clearArea,
  clearAreaSelection,
  changeSelectedArea,
  deleteSelectedArea,
};

export type StageActionTypes = ExportActionTypes<typeof StageActions>;

export default StageActions;
