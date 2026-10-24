import type { DragItem } from "@editor/builder/types/drag";
import { Drag } from "@editor/builder/types/drag";
import type { Row } from "@editor/builder/types/layout";
import { useAppDispatch, useAppStore } from "@editor/store";
import { fieldThunks } from "@editor/store/thunks/fields";
import { canPlaceField } from "@editor/store/thunks/fields/containers";
import type { RefObject } from "react";
import { useEffect, useState } from "react";
import type { ConnectDropTarget } from "react-dnd";
import { useDrop } from "react-dnd";
import { sectionDragPresentation } from "../field/section-drag";
import { isInsideContainer, rowInsertionIndex } from "./row-placement";

type FieldDrop = {
  sectionHeight: number;
  sectionLabel: string;
  sectionPreview: string;
  isOver: boolean;
  isCurrentRow: boolean;
  isDraggingField: boolean;
  dragFieldIndex: number;
  canDrop: boolean;
};

type FieldDropHook = {
  sectionHeight: number;
  sectionLabel: string;
  sectionPreview: string;
  ref: ConnectDropTarget;
  isOver: boolean;
  canDrop: boolean;
  isCurrentRow: boolean;
  isDraggingField: boolean;
  dragFieldIndex: number | undefined;
  hoverPosition: number | undefined;
  fieldWidth: number | undefined;
};

export const useRowFieldDrop = (
  wrapperRef: RefObject<HTMLDivElement>,
  row: Row,
  fieldCount: number,
  width: number,
): FieldDropHook => {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const [fieldWidth, setFieldWidth] = useState<number>();
  const [hoverPosition, setHoverPosition] = useState<number>();

  const [
    {
      isOver,
      isCurrentRow,
      dragFieldIndex,
      isDraggingField,
      canDrop,
      sectionHeight,
      sectionLabel,
      sectionPreview,
    },
    ref,
  ] = useDrop<DragItem, void, FieldDrop>(
    {
      accept: [Drag.Field, Drag.FieldType],
      collect: (monitor) => {
        const item = monitor.getItem();

        const isDraggingField = item?.type === Drag.Field;
        const isCurrentRow =
          item?.type === Drag.Field && item.data.rowUid === row.uid;

        return {
          isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
          canDrop: monitor.canDrop(),
          dragFieldIndex: item?.type === Drag.Field ? item.index : undefined,
          isCurrentRow,
          isDraggingField: isDraggingField,
          ...sectionDragPresentation(item),
        };
      },
      canDrop: (item, monitor) => {
        if (
          !monitor.isOver({ shallow: true }) ||
          !row.layoutUid ||
          (item.type !== Drag.Field && item.type !== Drag.FieldType)
        )
          return false;
        // Keep a container's columns stationary while entering it. Otherwise
        // the parent row reserves a sibling slot and moves the intended target.
        const point = monitor.getClientOffset();
        if (
          point &&
          wrapperRef.current &&
          isInsideContainer(wrapperRef.current, point)
        )
          return false;
        return canPlaceField(store.getState(), item.data, row.layoutUid);
      },
      hover: (item, monitor) => {
        if (width === undefined || !wrapperRef.current) {
          return;
        }

        const isThisRow =
          item.type === Drag.Field && item.data.rowUid === row.uid;

        const count = fieldCount + (isThisRow ? 0 : 1);
        if (count <= 1) {
          return;
        }

        // Read the row's viewport x-position on demand (during an active drag)
        // rather than storing it in state, which would cause re-renders on every
        // scroll or resize and feed back into the ResizeObserver loop.
        const offsetX = wrapperRef.current.getBoundingClientRect().x;
        const offset = monitor.getClientOffset();
        if (!offset) return;
        const position = rowInsertionIndex(offset.x, offsetX, width, count);
        if (hoverPosition !== position) {
          setHoverPosition(position);
        }
      },
      drop: (item, monitor) => {
        // A fast drop can precede the React render that updates hoverPosition.
        // Resolve the final pointer position here instead of using stale state.
        const point = monitor.getClientOffset();
        const bounds = wrapperRef.current?.getBoundingClientRect();
        const count =
          fieldCount +
          (item.type === Drag.Field && item.data.rowUid === row.uid ? 0 : 1);
        const position =
          point && bounds
            ? rowInsertionIndex(point.x, bounds.left, bounds.width, count)
            : (hoverPosition ?? Math.max(0, count - 1));
        if (item.type === Drag.Field) {
          dispatch(
            fieldThunks.move.existingField.existingRow(
              item.data,
              row,
              position,
            ),
          );
        } else if (item.type === Drag.FieldType) {
          dispatch(
            fieldThunks.move.newField.existingRow({
              fieldType: item.data,
              row,
              order: position,
            }),
          );
        }

        setHoverPosition(undefined);
      },
    },
    [wrapperRef, row, fieldCount, hoverPosition, width],
  );

  useEffect(() => {
    let count = fieldCount;

    if (isOver && !isCurrentRow) {
      count += 1;
    }

    setFieldWidth(width / Math.max(1, count));
  }, [isOver, fieldCount, width, isCurrentRow]);

  return {
    ref,
    isOver,
    isCurrentRow,
    isDraggingField,
    canDrop,
    hoverPosition,
    fieldWidth,
    dragFieldIndex,
    sectionHeight,
    sectionLabel,
    sectionPreview,
  };
};
