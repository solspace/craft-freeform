import { DuplicateButton } from "@components/elements/duplicate-button/duplicate";
import { RemoveButton } from "@components/elements/remove-button/remove";
import { useModal } from "@components/modals/modal.context";
import config from "@config/freeform/freeform.config";
import type { Row } from "@editor/builder/types/layout";
import { useAppDispatch } from "@editor/store";
import { contextActions, FocusType } from "@editor/store/slices/context";
import type { Field as FieldPropType } from "@editor/store/slices/layout/fields";
import { fieldThunks } from "@editor/store/thunks/fields";
import { Fields } from "@ff-client/types/field.classes";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { memo, useMemo } from "react";
import { DragPreviewImage } from "react-dnd";

import { FieldCell } from "./cell/cell";
import { FieldAssociationsBadges } from "./cell/cell-badges";
import { useFieldDragAnimation } from "./field.animations";
import { useFieldDrag } from "./field.drag";
import { createPreview } from "./field.drag.preview";
import { FieldTools, FieldWrapper } from "./field.styles";

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
    const { confirmDelete } = useModal();
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
    const dragPreview = useMemo(
      () => createPreview(field.properties?.label),
      [field.properties?.label],
    );

    return (
      <>
        <DragPreviewImage connect={preview} src={dragPreview} />
        <FieldWrapper
          role="group"
          aria-label={field.properties?.label}
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.target === event.currentTarget &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              dispatch(
                contextActions.setFocusedItem({
                  type: FocusType.Field,
                  uid: field.uid,
                }),
              );
            }
          }}
          ref={(el) => {
            drag(el);
          }}
          style={style}
        >
          <FieldTools>
            <FieldAssociationsBadges uid={field.uid} />
            {canDuplicate && (
              <DuplicateButton
                active
                onClick={() => {
                  dispatch(contextActions.unfocus());
                  dispatch(fieldThunks.duplicate(field, row));
                }}
              />
            )}
            <RemoveButton
              active
              onClick={() => {
                confirmDelete({
                  title: translate("Delete field?"),
                  message: translate(
                    field.typeClass === Fields.Group
                      ? 'Are you sure you want to delete "{name}" from this form? All fields inside this group will also be removed.'
                      : 'Are you sure you want to delete "{name}" from this form?',
                    {
                      name:
                        field.properties?.label ||
                        field.properties?.handle ||
                        translate("Field"),
                    },
                  ),
                  onConfirm: () => {
                    dispatch(contextActions.unfocus());
                    dispatch(fieldThunks.remove(field));
                  },
                });
              }}
            />
          </FieldTools>
          <FieldCell field={field} />
        </FieldWrapper>
      </>
    );
  },
);

Field.displayName = "Field";
