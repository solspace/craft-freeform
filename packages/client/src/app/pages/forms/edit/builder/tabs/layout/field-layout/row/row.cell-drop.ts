import type { MutableRefObject } from 'react';
import { useEffect, useState } from 'react';
import type { ConnectDropTarget } from 'react-dnd';
import { useDrop } from 'react-dnd';
import type { DragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { Row } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { moveExistingCellToExistingRow } from '@editor/store/thunks/cells';
import { addNewFieldToExistingRow } from '@editor/store/thunks/fields';

type CellDrop = {
  isOver: boolean;
  isCurrentRow: boolean;
  isDraggingCell: boolean;
  dragCellIndex: number;
  canDrop: boolean;
};

type CellDropHook = {
  ref: ConnectDropTarget;
  isOver: boolean;
  canDrop: boolean;
  isCurrentRow: boolean;
  isDraggingCell: boolean;
  dragCellIndex: number | undefined;
  hoverPosition: number | undefined;
  cellWidth: number | undefined;
};

export const useRowCellDrop = (
  wrapperRef: MutableRefObject<HTMLDivElement>,
  row: Row,
  cellCount: number,
  width: number,
  offsetX: number
): CellDropHook => {
  const dispatch = useAppDispatch();
  const [cellWidth, setCellWidth] = useState<number>();
  const [hoverPosition, setHoverPosition] = useState<number>();

  const [
    { isOver, isCurrentRow, dragCellIndex, isDraggingCell, canDrop },
    ref,
  ] = useDrop<DragItem, void, CellDrop>(
    {
      accept: [Drag.Cell, Drag.FieldType],
      collect: (monitor) => {
        const item = monitor.getItem();

        const isDraggingCell = item?.type === Drag.Cell;
        const isCurrentRow =
          item?.type === Drag.Cell && item.data.rowUid === row.uid;

        return {
          isOver: monitor.isOver({ shallow: true }),
          canDrop: monitor.canDrop(),
          dragCellIndex: item?.type === Drag.Cell ? item.index : undefined,
          isCurrentRow,
          isDraggingCell,
        };
      },
      canDrop: (_, monitor) => monitor.isOver({ shallow: true }),
      hover: (item, monitor) => {
        if (width === undefined || offsetX === undefined) {
          return;
        }

        const isThisRow =
          item.type === Drag.Cell && item.data.rowUid === row.uid;

        const count = cellCount + (isThisRow ? 0 : 1);
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
        if (item.type === Drag.Cell) {
          dispatch(
            moveExistingCellToExistingRow(item.data, row, hoverPosition)
          );
        } else if (item.type === Drag.FieldType) {
          dispatch(
            addNewFieldToExistingRow({
              fieldType: item.data,
              row,
              order: hoverPosition,
            })
          );
        }

        setHoverPosition(undefined);
      },
    },
    [wrapperRef, row, cellCount, hoverPosition, width]
  );

  useEffect(() => {
    let count = cellCount;

    if (isOver && !isCurrentRow) {
      count += 1;
    }

    setCellWidth(width / Math.max(1, count));
  }, [isOver, cellCount, width, isCurrentRow]);

  return {
    ref,
    isOver,
    isCurrentRow,
    isDraggingCell,
    canDrop,
    hoverPosition,
    cellWidth,
    dragCellIndex,
  };
};
