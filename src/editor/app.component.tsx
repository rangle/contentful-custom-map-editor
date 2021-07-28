import { Flex } from "@contentful/forma-36-react-components";
import React, { FC, useEffect, useReducer, useState } from "react";
import styled from "styled-components";
import { readFromFile } from "../utils/screens";
import AppActions from "./app.actions";
import { StateContext } from "./app.context";
import { AppState, reducer } from "./app.reducers";
import { ImageMetaData, Stage } from "./stage";

const EditorSection = styled.div`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: scroll;
  user-select: none; /* for safari & chrome browsers */
  -webkit-user-select: none; /* for safari & chrome browsers */
  -moz-user-select: none; /* for mozilla browsers */
`;

const SvgContainer = styled.div<{
  dimensions: { width: number; height: number };
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ dimensions: { width } }) => width}px;
  height: ${({ dimensions: { width } }) => width}px;
`;

const MaskImage = styled.img<{
  polygon: string | null;
}>`
  clip-path: polygon(${({ polygon }) => polygon ?? "0 0"});
  position: absolute;
  top: 0;
  left: 0;
`;

export type EditorProps = AppState & {
  onChangeState: (newState: AppState) => void;
};

const Editor: FC<EditorProps> = ({ onChangeState, ...initialAppState }) => {
  const { backgroundImage, maskImage } = initialAppState.selectedScreen || {};
  console.log(">>EDITOR", initialAppState.selectedScreen);
  const [maskPolygonData, setMaskPolygonData] = useState<string | null>(null);
  const [imgMetaData, setImgMetaData] = useState<ImageMetaData | null>(null);

  const [state, dispatch] = useReducer(reducer, initialAppState);
  useEffect(() => {
    console.log("CHANGED STATE", state);
    onChangeState(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state.mode === "empty") {
    console.log("CREATE EMPTY SCREEN");
    dispatch(AppActions.createScreen());
    return <Flex>...loading</Flex>;
  } else if (state.mode === "edit" && state.selectedScreen) {
    const { width, height } = imgMetaData
      ? imgMetaData
      : backgroundImage?.details.image ?? { width: 0, height: 0 };

    return (
      <StateContext.Provider value={[state, dispatch]}>
        <EditorSection>
          {maskImage && (
            <MaskImage
              polygon={maskPolygonData}
              src={maskImage.url}
              onLoad={({ currentTarget }) => {
                if (!currentTarget) return;
                const { x, y, width, height } =
                  currentTarget.getBoundingClientRect();
                setImgMetaData({ ...imgMetaData, x, y, width, height });
              }}
            />
          )}
          {backgroundImage && (
            <img
              src={backgroundImage.url}
              onLoad={({ currentTarget }) => {
                if (!currentTarget) return;
                const { x, y, width, height } =
                  currentTarget.getBoundingClientRect();
                setImgMetaData({ ...imgMetaData, x, y, width, height });
              }}
              alt={"background"}
            />
          )}
          <SvgContainer dimensions={{ width, height }}>
            <Stage
              areas={state.selectedScreen.areas || []}
              setMask={(mask) => setMaskPolygonData(mask)}
            />
          </SvgContainer>
        </EditorSection>
      </StateContext.Provider>
    );
  }
  return <>Unexpected Condition</>;
};

export default Editor;
