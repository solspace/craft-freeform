import { layoutColumnWidths } from "@editor/builder/tabs/layout/field-list/catalog/catalog.types";
import { useAppSelector } from "@editor/store";
import type { Field } from "@editor/store/slices/layout/fields";
import { useAssetQuery } from "@ff-client/queries/assets";
import { colors } from "@ff-client/styles/variables";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { shallowEqual } from "react-redux";
import styled from "styled-components";
import { FieldCellWrapper } from "../../field/cell/cell.styles";
import { GroupFieldLayout } from "../group-field-layout/group-field-layout";
import { GroupFieldLayoutWrapper } from "../group-field-layout/group-field-layout.styles";
import { cardAppearance, sectionAppearance } from "./appearance";

const Columns = styled.div<{ $widths: string; $gap: number }>`
  position: relative;
  display: grid;
  grid-template-columns: ${({ $widths }) => $widths};
  gap: ${({ $gap }) => $gap}px;
  min-width: 0;
  width: 100%;
  &[data-appearance='true'] {
    box-sizing: border-box; background-color: var(--freeform-background-color); background-image: var(--freeform-background-image); background-size: cover; background-position: center;
    color: var(--freeform-text-color); padding: var(--freeform-padding); min-height: var(--freeform-min-height); align-content: stretch;
    &[data-active='true']::before { content: ''; position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 0 0 var(--freeform-padding) rgb(87 130 239 / 12%); }
    &[data-active='true']::after { content: attr(data-padding); position: absolute; bottom: 3px; right: 6px; padding: 1px 5px; border-radius: 3px; background: #f3f7fd; color: ${colors.gray500}; font-size: 10px; line-height: 14px; pointer-events: none; }
    > section, > section > ${GroupFieldLayoutWrapper} { background: transparent; }
    ${FieldCellWrapper}:hover { background: rgb(128 128 128 / 12%); }
    :is(h1,h2,h3,h4,h5,h6,p) { color: inherit; }
  }
  > section { position: relative; display: flex; flex-direction: column; min-width: 0; border: 1px solid transparent; border-radius: 4px; background: ${colors.white}; }
  > section > ${GroupFieldLayoutWrapper} { flex: 1 0 auto; height: auto; min-width: 0; border-color: transparent; display: flex; flex-direction: column; justify-content: var(--freeform-vertical-alignment, flex-start); }
  &[data-cards='true'] { grid-auto-rows: 1fr; }
  &[data-cards='true'] > section { box-sizing: border-box; background: var(--freeform-card-background); color: var(--freeform-card-color); border: var(--freeform-card-border-width) solid var(--freeform-card-border-color); border-radius: var(--freeform-card-radius); padding: var(--freeform-card-padding); }
  &[data-cards='true'] > section > ${GroupFieldLayoutWrapper} { background: transparent; padding: 0; }
  &[data-cards='true'] > section :is(h1,h2,h3,h4,h5,h6,p) { color: var(--freeform-card-color); }
  > section:hover { outline: 1px dashed #8aa2b8; outline-offset: -1px; }
  > section > header { position: absolute; top: 1px; left: 6px; z-index: 3; display: flex; align-items: center; height: 18px; padding: 2px 5px; border-radius: 3px; background: #f3f7fd; color: ${colors.gray500}; font-size: 10px; line-height: 14px; opacity: 0; visibility: hidden; pointer-events: none; }
  &[data-active='true'] > section > header,
  > section:hover > header,
  > section:has(.active) > header,
  > section:focus-within > header { opacity: 1; visibility: visible; }
  > section:has(.quiet-label:hover) > header,
  > section:has(.quiet-label.active) > header { opacity: 0; visibility: hidden; }
`;

export const ColumnsLayout: React.FC<{ field: Field; active?: boolean }> = ({
  field,
  active,
}) => {
  const imageIds = Array.isArray(field.properties.backgroundImage)
    ? field.properties.backgroundImage.map(Number)
    : [];
  const { data: images } = useAssetQuery(
    field.properties.background === "image" ? imageIds : [],
  );
  const appearance = sectionAppearance(
    field.properties,
    images?.[imageIds[0]]?.src,
  );
  const columns = useAppSelector((state) => {
    const rows = state.layout.rows.filter(
      (row) => row.layoutUid === field.properties.layout,
    );
    return state.layout.fields
      .filter((item) => rows.some((row) => row.uid === item.rowUid))
      .sort((a, b) => a.order - b.order);
  }, shallowEqual);
  const gap =
    { small: 5, medium: 9, large: 16 }[String(field.properties.gap)] ?? 9;
  return (
    <Columns
      $widths={layoutColumnWidths(
        field.properties.preset,
        field.properties.columnProportions,
      )}
      $gap={gap}
      data-layout-columns={field.uid}
      data-active={active}
      data-stack={field.properties.mobile !== "keep"}
      data-cards={field.properties.columnStyle === "cards"}
      data-appearance={Object.keys(appearance).length > 0}
      data-padding={translate("{size} padding", {
        size: appearance["--freeform-padding"] ?? "0px",
      })}
      style={
        {
          ...appearance,
          ...cardAppearance(field.properties),
          "--freeform-vertical-alignment":
            { top: "flex-start", middle: "center", bottom: "flex-end" }[
              String(field.properties.verticalAlignment)
            ] ?? "flex-start",
        } as React.CSSProperties
      }
    >
      {columns.map((column, index) => (
        <section
          key={column.uid}
          data-layout-column={column.uid}
          aria-label={translate("Column {number}", { number: index + 1 })}
          onClick={(event) => event.stopPropagation()}
        >
          <header>{translate("Column {number}", { number: index + 1 })}</header>
          <GroupFieldLayout
            field={column}
            layoutUid={String(column.properties.layout)}
          />
        </section>
      ))}
    </Columns>
  );
};
