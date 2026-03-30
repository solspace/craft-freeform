import { DuplicateButton } from "@components/elements/duplicate-button/duplicate";
import { RemoveButton } from "@components/elements/remove-button/remove";
import config from "@config/freeform/freeform.config";
import type { Row } from "@editor/builder/types/layout";
import { useAppDispatch } from "@editor/store";
import { contextActions } from "@editor/store/slices/context";
import type { Field as FieldPropType } from "@editor/store/slices/layout/fields";
import { fieldThunks } from "@editor/store/thunks/fields";
import type React from "react";
import { memo, useState } from "react";
import { DragPreviewImage } from "react-dnd";

import { FieldCell } from "./cell/cell";
import { useFieldDragAnimation } from "./field.animations";
import { useFieldDrag } from "./field.drag";
import { createPreview } from "./field.drag.preview";
import { FieldWrapper } from "./field.styles";

type Props = {
  field: FieldPropType;
  row: Row;
  index: number;
  width?: number;
  isOver: boolean;
  isCurrentRow: boolean;
  isDraggingField: boolean;
  dragFieldIndex?: number;
  hoverPosition?: number;
};

export const Field: React.FC<Props> = memo(
  ({
    field,
    row,
    index,
    width,
    isOver,
    isCurrentRow,
    isDraggingField,
    dragFieldIndex,
    hoverPosition,
  }) => {
    const dispatch = useAppDispatch();
    const [hovering, setHovering] = useState(false);
    const { isDragging, drag, preview } = useFieldDrag(field, index);
    const style = useFieldDragAnimation({
      width,
      isDragging,
      isOver,
      isCurrentRow,
      isDraggingField,
      dragFieldIndex,
      index,
      hoverPosition,
    });

    const canDuplicate = config.limitations.can("layout.fields.clone");

    return (
      <>
        <DragPreviewImage
          connect={preview}
          src={createPreview(field.properties?.label)}
        />
        <FieldWrapper
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          ref={(el) => {
            drag(el);
          }}
          style={style}
        >
          {canDuplicate && (
            <DuplicateButton
              active={hovering}
              onClick={() => {
                dispatch(contextActions.unfocus());
                dispatch(fieldThunks.duplicate(field, row));
              }}
            />
          )}
          <RemoveButton
            active={hovering}
            onClick={() => {
              dispatch(contextActions.unfocus());
              dispatch(fieldThunks.remove(field));
            }}
          />
          <FieldCell field={field} />
        </FieldWrapper>
      </>
    );
  },
);

Field.displayName = "Field";
