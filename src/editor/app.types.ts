export type Coordinates = readonly [number, number];

export type PolygonLine = Readonly<{
  type: "line";
  start: Coordinates;
  end?: Coordinates;
}>;

export type SelectableArea = Readonly<{
  type: "area";
  id: string;
  name: string;
  link: string;
  lines: ReadonlyArray<PolygonLine>;
  rolloverMask: boolean;
  fillColor: string;
  fillOpacity: string;
  stroke: string;
}>;

export type ImageFileDetails = {
  contentType: string;
  details: {
    image: {
      width: number;
      height: number;
    };
  };
  fileName: string;
  url: string;
};

export type InterfaceScreen = Readonly<{
  type: "screen";
  screenId: string;
  name: string;
  areas: ReadonlyArray<SelectableArea>;
  backgroundImage?: ImageFileDetails;
  maskImage?: ImageFileDetails;
}>;
