import type { MutableRefObject } from 'react';
import { useEffect, useState } from 'react';
import type { ConnectDropTarget } from 'react-dnd';
import { useDrop } from 'react-dnd';
import type { Cell, Row } from '@editor/builder/types/layout';
import { Drag } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { moveTo } from '@editor/store/slices/cells';

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
  placeholderPos: number | undefined;
  cellWidth: number | undefined;
};

export const useRowCellDrop = (
  wrapperRef: MutableRefObject<HTMLDivElement>,
  row: Row,
  cellCount: number
): CellDropHook => {
  const dispatch = useAppDispatch();
  const [width, setWidth] = useState<number>();
  const [cellWidth, setCellWidth] = useState<number>();
  const [wrapperOffsetX, setWrapperOffsetX] = useState<number>();
  const [placeholderPos, setPlaceholderPos] = useState<number>();

  useEffect(() => {
    if (!wrapperRef.current) {
      return;
    }

    const boundingBox = wrapperRef.current.getBoundingClientRect();
    setWidth(boundingBox.width);
    setWrapperOffsetX(boundingBox.x);
  }, [wrapperRef]);

  useEffect(() => {
    setCellWidth(width / (cellCount + 1));
  }, [width, cellCount]);

  const [{ isOver, isCurrentRow, canDrop }, ref] = useDrop<
    Cell,
    void,
    CellDrop
  >(
    {
      accept: [Drag.Cell, Drag.FieldType],
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
        isCurrentRow: monitor.getItem()?.rowUid === row.uid,
      }),
      hover: (item, monitor) => {
        if (width === undefined || wrapperOffsetX === undefined) {
          return;
        }

        const count = cellCount - (item?.rowUid === row.uid ? 1 : 0) + 1;
        if (count <= 1) {
          return;
        }

        const offset = monitor.getClientOffset();
        const x = offset.x - wrapperOffsetX;

        const position = Math.floor(x / (width / count));
        if (placeholderPos !== position) {
          setPlaceholderPos(position);
        }
      },
      drop: (item) => {
        setPlaceholderPos(undefined);
        dispatch(moveTo({ uid: item.uid, rowUid: row.uid, position: 0 }));
      },
    },
    [wrapperRef, row, cellCount, placeholderPos, width]
  );

  return {
    ref,
    isOver,
    isCurrentRow,
    canDrop,
    placeholderPos,
    cellWidth,
  };
};
