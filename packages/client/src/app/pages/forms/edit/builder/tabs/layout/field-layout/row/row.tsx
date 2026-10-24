import type { Row as RowType } from "@editor/builder/types/layout";
import type { Field as FieldDefinition } from "@editor/store/slices/layout/fields";
import { fieldSelectors } from "@editor/store/slices/layout/fields/fields.selectors";
import { useDimensionsObserver } from "@ff-client/hooks/use-height-animation";
import type React from "react";
import type { RefObject } from "react";
import { memo, useMemo } from "react";
import { shallowEqual, useSelector } from "react-redux";

import { Field } from "../field/field";
import { FieldDragPlaceholder } from "../field/field.placeholder";

import { usePlaceholderAnimation, useRowAnimation } from "./row.animations";
import { useRowDrop } from "./row.drop";
import { useRowFieldDrop } from "./row.field-drop";
import {
  DropZone,
  DropZoneAnimation,
  RowFieldsContainer,
  RowWrapper,
} from "./row.styles";

type Props = {
  row: RowType;
};

const Row: React.FC<Props> = memo(({ row }) => {
  const selectFields = useMemo(() => fieldSelectors.inRow(row), [row]);
  const fields: FieldDefinition[] = useSelector(selectFields, shallowEqual);

  const { ref: wrapperRef, dimensions } =
    useDimensionsObserver<HTMLDivElement>();

  const width = dimensions.width;

  const {
    ref: rowDropRef,
    isOver: isOverRow,
    sectionHeight: rowSectionHeight,
    sectionLabel: rowSectionLabel,
    sectionPreview: rowSectionPreview,
  } = useRowDrop(row);
  const placeholderAnimation = usePlaceholderAnimation(isOverRow);
  const rowAnimation = useRowAnimation(isOverRow && !rowSectionHeight);

  const {
    ref: fieldDropRef,
    isOver,
    isCurrentRow,
    isDraggingField,
    dragFieldIndex,
    hoverPosition,
    fieldWidth,
    sectionHeight,
    sectionLabel,
    sectionPreview,
  } = useRowFieldDrop(wrapperRef, row, fields.length, width);

  const ref = fieldDropRef(wrapperRef) as unknown as RefObject<HTMLDivElement>;

  return (
    <RowWrapper
      ref={ref}
      style={{
        paddingTop: isOverRow && rowSectionHeight ? rowSectionHeight + 10 : 0,
      }}
    >
      <DropZone
        ref={(el) => {
          rowDropRef(el);
        }}
        style={
          isOverRow && rowSectionHeight
            ? { height: rowSectionHeight, top: 0 }
            : undefined
        }
      >
        <DropZoneAnimation
          style={
            isOverRow && rowSectionHeight
              ? { opacity: 1, height: rowSectionHeight, transform: "none" }
              : placeholderAnimation
          }
          aria-hidden="true"
        >
          {isOverRow && rowSectionPreview ? (
            <img
              src={rowSectionPreview}
              alt=""
              style={{
                width: 240,
                maxWidth: "85%",
                maxHeight: "85%",
                objectFit: "contain",
              }}
            />
          ) : isOverRow ? (
            rowSectionLabel
          ) : null}
        </DropZoneAnimation>
      </DropZone>
      <RowFieldsContainer
        style={{
          ...rowAnimation,
          minHeight: isOver && !isCurrentRow ? sectionHeight : undefined,
        }}
      >
        <FieldDragPlaceholder
          isActive={isOver}
          hoverPosition={hoverPosition}
          fieldWidth={fieldWidth}
          sectionHeight={sectionHeight}
          sectionLabel={sectionLabel}
          sectionPreview={sectionPreview}
        />
        {fields.map((field, idx) => (
          <Field
            field={field}
            row={row}
            isOver={isOver}
            hoverPosition={hoverPosition}
            isCurrentRow={isCurrentRow}
            isDraggingField={isDraggingField}
            dragFieldIndex={dragFieldIndex}
            index={idx}
            key={field.uid}
            width={fieldWidth || Math.floor(width / Math.max(1, fields.length))}
          />
        ))}
      </RowFieldsContainer>
    </RowWrapper>
  );
});

Row.displayName = "Row";

export { Row };
