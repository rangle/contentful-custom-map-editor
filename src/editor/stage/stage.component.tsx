import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import {
  Coordinates,
  SelectableArea,
  PolygonLine,
  InterfaceScreen,
} from "../app.types";
import { useKeyDown } from "../../utils/hooks";
import styled from "styled-components";
import { StateContext } from "../app.context";
import { StageActions } from "./stage.actions";

const DRAWING_LINE_BORDER = "lightgrey";
const DRAWING_LINE_BORDER_HIGHLIGHT = "black";

const DRAWING_AREA_BORDER = "lightgrey";
const DRAWING_AREA_BORDER_HIGHLIGHT = "black";

const SELECTED_AREA_BORDER = "white";
const SELECTED_AREA_BORDER_HIGHLIGHT = "grey";
const SELECTED_AREA_COLOR = "red";
const SELECTED_AREA_OPACITY = "25%";

const getCoordinates = ({
  clientX,
  clientY,
  currentTarget,
}: React.MouseEvent<Element, MouseEvent>) => {
  const { left, top } = currentTarget.getBoundingClientRect();
  return [clientX - left, clientY - top];
};

const Drawing = styled.svg`
  border: 1px solid green;
  background-color: transparent;
`;

const RedLine = styled.line`
  stroke: ${DRAWING_LINE_BORDER};
  stroke-width: 1;
`;

const RedLineHighlight = styled.line`
  stroke: ${DRAWING_LINE_BORDER_HIGHLIGHT};
  stroke-width: 1;
  stroke-dasharray: 2, 2;
  stroke-width: 1;
`;

const GreyOpenPolygon = styled.polyline`
  stroke: ${DRAWING_AREA_BORDER};
  stroke-width: 1;
  fill: none;
`;
const GreyOpenPolygonHighlight = styled.polyline`
  stroke: ${DRAWING_AREA_BORDER_HIGHLIGHT};
  stroke-width: 1;
  stroke-dasharray: 2, 2;
  stroke-width: 1;
  fill: none;
`;

const GreyClosedPolygon = styled.polygon`
  stroke: ${SELECTED_AREA_BORDER};
  stroke-width: 1;
`;

const GreyClosedPolygonHighlight = styled.polygon`
  stroke: ${SELECTED_AREA_BORDER_HIGHLIGHT};
  stroke-width: 1;
  stroke-dasharray: 2, 2;
`;

const DrawingLine: FC<{
  line: PolygonLine | null;
  position: Coordinates;
  modifiers: MouseModifiers;
}> = ({ line, position, modifiers }) => {
  if (!line) return <></>;
  const [x1, y1] = line.start;
  const [x, y] = position;
  // TODO: use only shift for orthogonal -- detect whether it's vertical or horiz.
  const [x2, y2] = modifyCoordinates(modifiers, x, y, x1, y1);
  return (
    <>
      <RedLine {...{ x1, y1, x2, y2 }} />
      <RedLineHighlight {...{ x1, y1, x2, y2 }} />
    </>
  );
};

const renderPathSegment = ({ start, end }: PolygonLine) =>
  end ? `${start[0]},${start[1]} ${end[0]},${end[1]} ` : "";

const DrawingArea: FC<{ area: SelectableArea | null }> = ({ area }) => {
  if (!area) return <></>;
  const points = area.lines.map(renderPathSegment);
  return (
    <>
      <GreyOpenPolygon points={points.join(" ")} />
      <GreyOpenPolygonHighlight id={area.id} points={points.join(" ")} />
    </>
  );
};

const CompletedArea: FC<{
  area: SelectableArea;
  onClick: () => void;
  onMouseEvent: (inside: boolean) => void;
}> = ({ area, onClick, onMouseEvent }) => {
  const points = area.lines.map(renderPathSegment);
  return (
    <>
      <GreyClosedPolygon
        points={points.join(" ")}
        stroke={area.stroke}
        fill="none"
      />
      <GreyClosedPolygonHighlight
        id={area.id}
        points={points.join(" ")}
        stroke={area.stroke}
        fill={area.fillColor}
        fillOpacity={area.fillOpacity}
        onClick={(event) => {
          onClick();
          event.stopPropagation();
        }}
        onMouseOver={() => onMouseEvent(true)}
        onMouseOut={() => onMouseEvent(false)}
      />
    </>
  );
};

const CompletedSelectedArea: FC<{ area: SelectableArea }> = ({ area }) => {
  const points = area.lines.map(renderPathSegment);
  return (
    <GreyClosedPolygon
      points={points.join(" ")}
      stroke={SELECTED_AREA_BORDER}
      fill={SELECTED_AREA_COLOR}
      fillOpacity={SELECTED_AREA_OPACITY}
    />
  );
};

export type ImageMetaData = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type MouseModifiers = [shift: boolean, ctrl: boolean, alt: boolean];

export const Stage: FC<{
  areas: InterfaceScreen["areas"];
  setMask: (mas: string) => void;
}> = ({ areas, setMask }) => {
  const [position, setPosition] = useState<Coordinates>([0, 0]);
  const [modifiers, setModifiers] = useState<MouseModifiers>([
    false,
    false,
    false,
  ]);
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error();
  const [state, dispatch] = ctx;

  const { status, drawingLine, drawingArea, selectedArea } = state.stage;
  useKeyDown(() => {
    dispatch(StageActions.addArea());
  }, ["Enter"]);

  useKeyDown(() => {
    dispatch(StageActions.clearArea());
    dispatch(StageActions.clearAreaSelection());
  }, ["Escape"]);

  useKeyDown(() => {
    dispatch(StageActions.deleteSelectedArea());
  }, ["Backspace"]);

  const selectArea = useCallback(
    (area: SelectableArea) => () => dispatch(StageActions.selectArea(area)),
    [dispatch]
  );

  return (
    <Drawing
      height="100%"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      onClick={(event) => {
        const [x, y] = getCoordinates(event);
        setPosition([x, y]);
        if (status === "idle") dispatch(StageActions.startLine([x, y]));
        if (status === "drawing" && drawingLine) {
          dispatch(
            StageActions.endLine(
              modifyCoordinates(modifiers, x, y, ...drawingLine.start)
            )
          );
        }
      }}
      onContextMenu={(e) => {
        dispatch(StageActions.clearArea());
        dispatch(StageActions.clearAreaSelection());
        e.preventDefault();
      }}
      onDoubleClick={(e) => (
        dispatch(StageActions.addArea()),
        e.preventDefault(),
        e.stopPropagation()
      )}
      onMouseMove={(event) => {
        if (status !== "drawing") return;
        const { shiftKey, ctrlKey, altKey } = event;
        setModifiers([shiftKey, ctrlKey, altKey]);
        const [x, y] = getCoordinates(event);
        setPosition([x, y]);
      }}
    >
      {status === "drawing" && (
        <>
          <DrawingLine
            line={drawingLine}
            position={position}
            modifiers={modifiers}
          />
          <DrawingArea area={drawingArea} />
        </>
      )}
      {areas.map((area) =>
        area === selectedArea ? (
          <CompletedSelectedArea key={area.id} area={area} />
        ) : (
          <CompletedArea
            key={area.id}
            area={area}
            onClick={selectArea(area)}
            onMouseEvent={(visible) => {
              const mask = area.lines
                .map(
                  ({ start: [x1, y1], end: [x2, y2] = [0, 0] }) =>
                    `${x1}px ${y1}px, ${x2}px ${y2}px`
                )
                .join();
              console.log("MASK", mask);
              return !visible ? setMask("0 0") : setMask(mask);
            }}
          />
        )
      )}
    </Drawing>
  );
};
const modifyCoordinates = (
  modifiers: MouseModifiers,
  x: number,
  y: number,
  x1: number,
  y1: number
): [number, number] => {
  if (!modifiers?.[0]) return [x, y];
  const dx = Math.abs(x - x1);
  const dy = Math.abs(y - y1);
  if (dx > dy) return [x, y1];
  else return [x1, y];
};
