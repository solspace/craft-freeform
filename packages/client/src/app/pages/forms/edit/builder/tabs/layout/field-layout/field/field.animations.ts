import type { SpringValue } from 'react-spring';
import { useSpring } from 'react-spring';

import { useDragContext } from '../../drag.context';

type FieldDragAnimation = (options: {
  width: number;
  isDragging: boolean;
  isOver: boolean;
  isCurrentRow: boolean;
  isDraggingField: boolean;
  dragFieldIndex?: number;
  index: number;
  hoverPosition?: number;
}) => {
  width: SpringValue<number>;
  x: SpringValue<number>;
};

const calculateX = (
  width: number,
  isOver: boolean,
  isCurrentRow: boolean,
  isDraggingField: boolean,
  index: number,
  dragFieldIndex?: number,
  hoverPosition?: number
): number => {
  if (!isOver || hoverPosition === undefined) {
    return 0;
  }

  if (isCurrentRow && isDraggingField && dragFieldIndex !== undefined) {
    if (index === dragFieldIndex) {
      return width * (hoverPosition - index);
    }

    if (dragFieldIndex > index) {
      if (index < hoverPosition) {
        return 0;
      }

      return width;
    }

    if (dragFieldIndex < index) {
      if (index <= hoverPosition) {
        return -width;
      }

      return 0;
    }

    return 0;
  }

  if (hoverPosition <= index) {
    return width;
  }

  if (hoverPosition > index) {
    return 0;
  }

  return 0;
};

export const useFieldDragAnimation: FieldDragAnimation = ({
  width,
  isDragging,
  isOver,
  isCurrentRow,
  isDraggingField,
  dragFieldIndex,
  index,
  hoverPosition,
}) => {
  const { isDragging: ctxDragging } = useDragContext();

  const x = calculateX(
    width,
    isOver,
    isCurrentRow,
    isDraggingField,
    index,
    dragFieldIndex,
    hoverPosition
  );

  const style = useSpring({
    immediate: (key) => {
      switch (key) {
        case 'x':
          return !ctxDragging;

        case 'width':
          return !ctxDragging;
      }
    },
    to: {
      width,
      x,
      opacity: isDragging ? 0.3 : 1,
    },
    config: {
      tension: 700,
      mass: 0.5,
    },
  });

  return style;
};
