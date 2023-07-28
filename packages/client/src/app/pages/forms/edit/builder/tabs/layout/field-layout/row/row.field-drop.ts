import type { MutableRefObject } from 'react';
import { useEffect, useState } from 'react';
import type { ConnectDropTarget } from 'react-dnd';
import { useDrop } from 'react-dnd';
import type { DragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { Row } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { fieldThunks } from '@editor/store/thunks/fields';

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
  wrapperRef: MutableRefObject<HTMLDivElement>,
  row: Row,
  fieldCount: number,
  width: number,
  offsetX: number
): FieldDropHook => {
  const dispatch = useAppDispatch();
  const [fieldWidth, setFieldWidth] = useState<number>();
  const [hoverPosition, setHoverPosition] = useState<number>();

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
      hover: (item, monitor) => {
        if (width === undefined || offsetX === undefined) {
          return;
        }

        const isThisRow =
          item.type === Drag.Field && item.data.rowUid === row.uid;

        const count = fieldCount + (isThisRow ? 0 : 1);
        if (count <= 1) {
          return;
        }

        const offset = monitor.getClientOffset();
        const x = offset.x - offsetX;

        const position = Math.floor(x / (width / count));
        if (hoverPosition !== position) {
          setHoverPosition(position);
        }
      },
      drop: (item) => {
        if (item.type === Drag.Field) {
          dispatch(
            fieldThunks.move.existingField.existingRow(
              item.data,
              row,
              hoverPosition
            )
          );
        } else if (item.type === Drag.FieldType) {
          dispatch(
            fieldThunks.move.newField.existingRow({
              fieldType: item.data,
              row,
              order: hoverPosition,
            })
          );
        }

        setHoverPosition(undefined);
      },
    },
    [wrapperRef, row, fieldCount, hoverPosition, width]
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
  };
};
