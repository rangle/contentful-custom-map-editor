import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Paragraph,
  SectionHeading,
  TextField,
  TextInput,
  TextLink,
} from "@contentful/forma-36-react-components";
import { Link, SidebarExtensionSDK } from "@contentful/app-sdk";
import { ImageFileDetails, SelectableArea } from "../editor/app.types";

interface SidebarProps {
  sdk: SidebarExtensionSDK;
}

const Sidebar = ({ sdk }: SidebarProps) => {
  const title = sdk.entry.fields["title"].getValue() as string;
  const background = sdk.entry.fields["background"].getValue() as Link;
  const rollover = sdk.entry.fields["rollover"].getValue() as Link;
  const areas = sdk.entry.fields["areas"].getValue() as Array<any>;
  const selected = sdk.entry.fields["selected"].getValue() as
    | number
    | undefined;

  const [value, setValue] = useState({ title, background, rollover, areas });
  console.log(value);

  const [backgroundImg, setBackgroundImg] = useState<any | null>(null);
  const [rolloverImg, setRolloverImg] = useState<any | null>(null);

  const [selectedArea, setSelectedArea] = useState<SelectableArea | null>(
    typeof selected === "number" ? areas[selected] : null
  );

  console.log("SELECTED AREA", selectedArea);
  useEffect(() => {
    console.log("SELECTED AREA EFFFECT");
    setSelectedArea(typeof selected === "number" ? areas[selected] : null);
  }, [areas, selected]);

  useEffect(() => {
    console.log("EFFECT");
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
    const detachAreasHandler = sdk.entry.fields["areas"].onValueChanged(
      (areas) =>
        setValue({
          ...value,
          areas,
        })
    );
    const detachSelectedHandler = sdk.entry.fields["selected"].onValueChanged(
      (selected) =>
        setSelectedArea(typeof selected === "number" ? areas[selected] : null)
    );
    return () => {
      detachTitleHandler();
      detachBackgroundHandler();
      detachRolloverHandler();
      detachAreasHandler();
      detachSelectedHandler();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk, selectedArea]);

  const bgImg = backgroundImg?.fields?.file?.[
    sdk.locales.default
  ] as ImageFileDetails;
  const roImg = rolloverImg?.fields?.file?.[
    sdk.locales.default
  ] as ImageFileDetails;

  const [mode, setMode] = useState<"show" | "edit">("show");
  const [linkText, setLinkText] = useState<string>(selectedArea?.link || "");

  const updateLink = () => {
    const tmpAreas = areas.filter((a) => a !== selectedArea);
    sdk.entry.fields.areas
      .setValue([
        ...tmpAreas,
        {
          ...selectedArea,
          link: linkText,
        },
      ])
      .then(() => {
        setLinkText("");
        setMode("show");
      });
  };

  return selectedArea ? (
    mode === "edit" ? (
      <SectionHeading>
        <strong>EDIT SELECTED {selectedArea.id}</strong>
        <Flex padding={`spacingM`}>
          <TextField
            labelText="Link URL"
            id="url"
            name="url"
            value={linkText}
            onChange={(v) => setLinkText(v.target.value)}
          />
        </Flex>
        <Button onClick={() => updateLink()}>OK</Button>
      </SectionHeading>
    ) : (
      <SectionHeading>
        <strong>SELECTED {selectedArea.id}</strong>
        <Flex padding={`spacingM`}>
          <TextLink
            iconPosition="left"
            linkType="primary"
            onClick={function noRefCheck() {}}
            testId="cf-ui-text-link"
          >
            {selectedArea.link}
          </TextLink>
        </Flex>
        <Button onClick={() => setMode("edit")}>Edit</Button>
      </SectionHeading>
    )
  ) : (
    <>
      <SectionHeading>ImageMap Navigator</SectionHeading>
      {bgImg && (
        <Paragraph>
          <strong>bgImg:</strong>
          {bgImg.fileName}[{bgImg.contentType}]
        </Paragraph>
      )}
      {roImg && (
        <Paragraph>
          <strong>roImg:</strong>
          {roImg.fileName}[{roImg.contentType}]
        </Paragraph>
      )}
      {value.areas && (
        <Paragraph>
          <strong>areas:</strong>
          {(value.areas as any[]).length}
        </Paragraph>
      )}
    </>
  );
};

export default Sidebar;
