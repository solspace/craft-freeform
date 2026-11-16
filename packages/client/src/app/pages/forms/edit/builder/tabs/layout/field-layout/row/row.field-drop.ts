import type { DragItem } from "@editor/builder/types/drag";
import { Drag } from "@editor/builder/types/drag";
import type { Row } from "@editor/builder/types/layout";
import { useAppDispatch, useAppStore } from "@editor/store";
import { fieldThunks } from "@editor/store/thunks/fields";
import { canPlaceField } from "@editor/store/thunks/fields/containers";
import type { RefObject } from "react";
import { useCallback, useEffect, useState } from "react";
import type { ConnectDropTarget } from "react-dnd";
import { useDragDropManager, useDrop } from "react-dnd";
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
  const manager = useDragDropManager();
  const [fieldWidth, setFieldWidth] = useState<number>();
  const [hoverPosition, setHoverPosition] = useState<number>();

  const getPosition = useCallback(
    (item: DragItem, offset: { x: number; y: number } | null) => {
      if (!item || !offset || !wrapperRef.current) return undefined;
      const bounds = wrapperRef.current.getBoundingClientRect();
      if (bounds.width <= 0) return undefined;
      const sameRow = item.type === Drag.Field && item.data.rowUid === row.uid;
      const count = fieldCount + (sameRow ? 0 : 1);
      return rowInsertionIndex(offset.x, bounds.left, bounds.width, count);
    },
    [wrapperRef, row.uid, fieldCount],
  );

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
      drop: (item, monitor) => {
        // The native backend hovers and drops in one event. React may not have
        // rendered that last hover, so resolve the release coordinates directly.
        const position = getPosition(item, monitor.getClientOffset());
        if (position === undefined) return;
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
    [row, getPosition, store],
  );

  useEffect(() => {
    if (!isOver) {
      setHoverPosition(undefined);
      return;
    }
    const monitor = manager.getMonitor();
    const updatePosition = () => {
      setHoverPosition(
        getPosition(monitor.getItem<DragItem>(), monitor.getClientOffset()),
      );
    };
    // hover() runs before React DnD publishes the new pointer offset. Subscribe
    // to the committed offset, only while this row is the active drop target.
    updatePosition();
    return monitor.subscribeToOffsetChange(updatePosition);
  }, [manager, isOver, getPosition]);

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
