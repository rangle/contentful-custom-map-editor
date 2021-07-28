import React, { FC, useEffect, useState } from "react";
import { EditorExtensionSDK } from "@contentful/app-sdk";
import { AppState, initialAppState } from "../editor/app.reducers";
import Editor from "../editor/app.component";
import { Link } from "@contentful/app-sdk";
import { ImageFileDetails, SelectableArea } from "../editor/app.types";

interface EditorProps {
  sdk: EditorExtensionSDK;
}

const fields = (sdk: EditorExtensionSDK) => ({
  get: <K extends string, T extends Record<K, string>>(
    fieldNames: ReadonlyArray<K>
  ) =>
    fieldNames.reduce(
      (res, name) => ({
        ...res,
        [name]: sdk.entry.fields[name as string].getValue(),
      }),
      {} as T
    ),
  set: <T,>(fieldName: string, value: T) =>
    sdk.entry.fields[fieldName].setValue(value),
});

const persistScreen = (
  old: ReadonlyArray<SelectableArea> | undefined,
  screen: AppState["selectedScreen"],
  set: (
    name: string,
    value: undefined | ReadonlyArray<SelectableArea>
  ) => Promise<void>
) => {
  const newValue = JSON.stringify(screen?.areas);
  const oldValue = JSON.stringify(old);
  console.log("PERSISTING CHANGES", newValue !== oldValue);
  if (newValue !== oldValue)
    return set("areas", screen?.areas).then(() => screen?.areas);
  return Promise.resolve(old);
};
const Entry: FC<EditorProps> = ({ sdk }) => {
  const { set } = fields(sdk);
  const title = sdk.entry.fields["title"].getValue() as string;
  const background = sdk.entry.fields["background"].getValue() as Link;
  const rollover = sdk.entry.fields["rollover"].getValue() as Link;
  const areas = sdk.entry.fields["areas"].getValue() as
    | ReadonlyArray<SelectableArea>
    | undefined;
  const [value, setValue] = useState({ title, background, rollover, areas });
  const [backgroundImg, setBackgroundImg] = useState<any | null>(null); //  add proper type for Contentful Assets
  const [rolloverImg, setRolloverImg] = useState<any | null>(null);
  const selected = sdk.entry.fields["selected"].getValue() as
    | number
    | undefined;
  console.log("ENTRY!!", { title, backgroundImg, rolloverImg, areas });

  const state: AppState = {
    ...initialAppState,
    selectedScreen: {
      type: "screen",
      name: value.title,
      screenId: value.title,
      backgroundImage: backgroundImg?.fields?.file[
        sdk.locales.default
      ] as ImageFileDetails,
      maskImage: rolloverImg?.fields?.file[
        sdk.locales.default
      ] as ImageFileDetails,
      areas: value.areas || [],
    },
  };

  console.log("STATE!!", state);

  const [selectedArea, setSelectedArea] = useState<SelectableArea | null>(
    typeof selected === "number" && areas ? areas[selected] : null
  );

  console.log("SELECTED AREA", selectedArea);
  useEffect(() => {
    console.log("SELECTED AREA EFFFECT");
    setSelectedArea(
      typeof selected === "number" && areas ? areas[selected] : null
    );
  }, [areas, selected]);

  useEffect(() => {
    console.log("EFFFECT");
    background &&
      sdk.space.getAsset(background.sys.id).then((img) => {
        setBackgroundImg(img);
      });
    rollover &&
      sdk.space.getAsset(rollover.sys.id).then((img) => {
        setRolloverImg(img);
      });
  }, [background, rollover, sdk.space]);

  useEffect(() => {
    console.log("EFFFECT");
    const detachTitleHandler = sdk.entry.fields["title"].onValueChanged(
      (title) =>
        setValue({
          ...value,
          title,
        })
    );
    const detachBackgroundHandler = sdk.entry.fields[
      "background"
    ].onValueChanged((background) =>
      setValue({
        ...value,
        background,
      })
    );
    const detachRolloverHandler = sdk.entry.fields["rollover"].onValueChanged(
      (rollover) =>
        setValue({
          ...value,
          rollover,
        })
    );

    return () => {
      detachTitleHandler();
      detachBackgroundHandler();
      detachRolloverHandler();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk]);
  return (
    <>
      <Editor
        {...state}
        onChangeState={(state) => {
          persistScreen(value.areas, state.selectedScreen, set).then(
            (areas) => {
              setValue({
                ...value,
                areas,
              });
              if (areas?.length && state.stage.selectedArea) {
                const selection = areas.indexOf(state.stage.selectedArea);
                console.log("UPDATING SELECTIONS", selection);
                set("selected", selection);
              } else {
                console.log("UPDATING SELECTIONS: null");
                set("selected", undefined);
              }
            }
          );
          setSelectedArea(state.stage.selectedArea);
        }}
      />
    </>
  );
};

export default Entry;
