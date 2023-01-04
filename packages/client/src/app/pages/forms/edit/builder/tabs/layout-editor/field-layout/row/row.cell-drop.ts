import type { MutableRefObject } from 'react';
import { useEffect, useState } from 'react';
import type { ConnectDropTarget } from 'react-dnd';
import { useDrop } from 'react-dnd';
import type { Row } from '@editor/builder/types/layout';
import { Drag } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { moveTo } from '@editor/store/slices/cells';
import { addNewFieldToRow } from '@editor/store/thunks/fields';

type CellDrop = {
  isOver: boolean;
  isCurrentRow: boolean;
  canDrop: boolean;
};

type CellDropHook = {
  ref: ConnectDropTarget;
  isOver: boolean;
  canDrop: boolean;
  isCurrentRow: boolean;
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

  const [{ isOver, isCurrentRow, canDrop }, ref] = useDrop<any, void, CellDrop>(
    {
      accept: [Drag.Cell, Drag.FieldType],
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
        isCurrentRow: monitor.getItem()?.rowUid === row.uid,
      }),
      hover: (item, monitor) => {
        if (width === undefined || offsetX === undefined) {
          return;
        }

        const count = cellCount + (item?.rowUid === row.uid ? 0 : 1);
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
        const isCell = item?.targetUid !== undefined;

        if (isCell) {
          dispatch(
            moveTo({ uid: item.uid, rowUid: row.uid, position: hoverPosition })
          );
        } else {
          dispatch(addNewFieldToRow(item, row, hoverPosition));
        }

        setHoverPosition(undefined);
      },
    },
    [wrapperRef, row, cellCount, hoverPosition, width]
  );

  useEffect(() => {
    if (isOver && !isCurrentRow) {
      setCellWidth(width / (cellCount + 1));
    } else {
      setCellWidth(width / cellCount);
    }
  }, [isOver, width, isCurrentRow]);

  return {
    ref,
    isOver,
    isCurrentRow,
    canDrop,
    hoverPosition,
    cellWidth,
  };
};
