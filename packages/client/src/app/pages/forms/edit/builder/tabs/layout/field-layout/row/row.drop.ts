import type { ConnectDropTarget } from 'react-dnd';
import { useDrop } from 'react-dnd';
import type { DragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { Row } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { moveExistingCellToNewRow } from '@editor/store/thunks/cells';
import { addNewFieldToNewRow } from '@editor/store/thunks/fields';

type RowDropHook = {
  ref: ConnectDropTarget;
  isOver: boolean;
  canDrop: boolean;
};

type CollectedProps = { isOver: boolean; canDrop: boolean };

export const useRowDrop = (row: Row): RowDropHook => {
  const dispatch = useAppDispatch();

  const [{ isOver, canDrop }, ref] = useDrop<DragItem, void, CollectedProps>(
    () => ({
      accept: [Drag.FieldType, Drag.Cell],
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
      canDrop: (_, monitor) => monitor.isOver({ shallow: true }),
      drop: (item) => {
        if (item.type === Drag.Cell) {
          dispatch(
            moveExistingCellToNewRow({
              cell: item.data,
              order: row.order,
            })
          );
        }

        if (item.type === Drag.FieldType) {
          dispatch(
            addNewFieldToNewRow({
              fieldType: item.data,
              row,
            })
          );
        }
      },
    }),
    [row]
  );

  return {
    ref,
    isOver,
    canDrop,
  };
};
