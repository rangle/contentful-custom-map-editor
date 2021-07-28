import { Action, ExportActionTypes, payload } from "../utils/actions";
import { ImageFileDetails } from "./app.types";

const changeImage = Action(
  "app/screen/image/change",
  payload<ImageFileDetails>()
);
const clearImage = Action("app/screen/image/clear", payload<void>());
const changeMaskImage = Action(
  "app/screen/mask/change",
  payload<ImageFileDetails>()
);
const clearMaskImage = Action("app/screen/mask/clear", payload<void>());

const changeName = Action("app/screen/name/change", payload<string>());
const clearName = Action("app/screen/name/clear", payload<void>());

const createScreen = Action("app/screen/create", payload<void>());

export const AppActions = {
  createScreen,
  changeImage,
  clearImage,
  changeMaskImage,
  clearMaskImage,
  changeName,
  clearName,
};

export type AppActionTypes = ExportActionTypes<typeof AppActions>;

export default AppActions;
