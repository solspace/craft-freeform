import type { DragItem } from "@editor/builder/types/drag";
import { Drag } from "@editor/builder/types/drag";
import type { Row } from "@editor/builder/types/layout";
import { useAppDispatch } from "@editor/store";
import { fieldThunks } from "@editor/store/thunks/fields";
import type { RefObject } from "react";
import { useCallback, useEffect, useState } from "react";
import type { ConnectDropTarget } from "react-dnd";
import { useDragDropManager, useDrop } from "react-dnd";

type FieldDrop = {
  isOver: boolean;
  isCurrentRow: boolean;
  isDraggingField: boolean;
  dragFieldIndex: number;
  canDrop: boolean;
};

type FieldDropHook = {
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
      const position = Math.floor(
        (offset.x - bounds.x) / (bounds.width / count),
      );
      return Math.max(0, Math.min(count - 1, position));
    },
    [wrapperRef, row.uid, fieldCount],
  );

  const [
    { isOver, isCurrentRow, dragFieldIndex, isDraggingField, canDrop },
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
          isOver: monitor.isOver({ shallow: true }),
          canDrop: monitor.canDrop(),
          dragFieldIndex: item?.type === Drag.Field ? item.index : undefined,
          isCurrentRow,
          isDraggingField: isDraggingField,
        };
      },
      canDrop: (_, monitor) => monitor.isOver({ shallow: true }),
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
    [row, getPosition],
  );

  useEffect(() => {
    if (!isOver) {
      setHoverPosition(undefined);
      return;
    }
    const monitor = manager.getMonitor();
    const updatePosition = () => {
      setHoverPosition(
        getPosition(monitor.getItem() as DragItem, monitor.getClientOffset()),
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
  };
};
