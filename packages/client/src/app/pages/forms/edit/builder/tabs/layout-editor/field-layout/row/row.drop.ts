import type { ConnectDropTarget } from 'react-dnd';
import { useDrop } from 'react-dnd';
import type { PickAnimated, SpringValues } from 'react-spring';
import { useSpring } from 'react-spring';
import type { Row } from '@editor/builder/types/layout';
import { Drag } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { addNewField } from '@editor/store/thunks/fields';
import type { FieldType } from '@ff-client/types/fields';

type RowDropHook = {
  dropRef: ConnectDropTarget;
  placeholderAnimation: SpringValues<
    PickAnimated<{ opacity: number; transform: string }>
  >;
  rowAnimation: SpringValues<PickAnimated<{ transform: string }>>;
  isOver: boolean;
};

type CollectedProps = { isOver: boolean };

export const useRowDrop = (row: Row): RowDropHook => {
  const dispatch = useAppDispatch();

  const [{ isOver }, dropRef] = useDrop<FieldType, void, CollectedProps>(
    () => ({
      accept: Drag.FieldType,
      collect: (monitor) => ({ isOver: monitor.isOver() }),
      canDrop: (_, monitor) => monitor.isOver({ shallow: true }),
      drop: (item) => {
        dispatch(addNewField(item, row));
      },
    }),
    [row]
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

  const rowAnimation = useSpring({
    to: {
      transform: isOver ? `translateY(10px)` : `translateY(0px)`,
    },
    config: {
      tension: 300,
    },
  });

  return {
    dropRef,
    placeholderAnimation,
    rowAnimation,
    isOver,
  };
};
