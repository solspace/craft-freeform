import type { ConnectDropTarget } from 'react-dnd';
import { useDrop } from 'react-dnd';
import type { PickAnimated, SpringValues } from 'react-spring';
import { useSpring } from 'react-spring';
import type { DragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { Layout } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { moveExistingCellToNewRow } from '@editor/store/thunks/cells';
import { addNewFieldToNewRow } from '@editor/store/thunks/fields';

type LayoutDropHook = {
  dropRef: ConnectDropTarget;
  placeholderAnimation: SpringValues<
    PickAnimated<{ opacity: number; transform: string }>
  >;
};

type CollectProps = {
  isOver: boolean;
};

export const useLayoutDrop = (layout: Layout): LayoutDropHook => {
  const dispatch = useAppDispatch();

  const [{ isOver }, dropRef] = useDrop<DragItem, void, CollectProps>(
    () => ({
      accept: [Drag.FieldType, Drag.Cell],
      collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
      canDrop: (_, monitor) => monitor.isOver({ shallow: true }),
      drop: (item) => {
        if (item.type === Drag.FieldType) {
          dispatch(addNewFieldToNewRow(item.data));
        }

        if (item.type === Drag.Cell) {
          dispatch(moveExistingCellToNewRow(item.data));
        }
      },
    }),
    [layout]
  );

  const placeholderAnimation = useSpring({
    to: {
      opacity: isOver ? 1 : 0,
      transform: isOver ? `scaleY(1)` : `scaleY(0)`,
    },
    config: {
      tension: 300,
    },
  });

  return {
    dropRef,
    placeholderAnimation,
  };
};
