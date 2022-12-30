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
};

export const useRowCellDrop = (row: Row): CellDropHook => {
  const dispatch = useAppDispatch();

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
      drop: (item) => {
        dispatch(moveTo({ uid: item.uid, rowUid: row.uid, position: 0 }));
      },
    },
    [row]
  );

  return {
    ref,
    isOver,
    isCurrentRow,
    canDrop,
  };
};
