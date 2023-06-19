import type { SpringValue } from 'react-spring';
import { useSpring } from 'react-spring';

import { useDragContext } from '../../drag.context';

type CellDragAnimation = (options: {
  width: number;
  isDragging: boolean;
  isOver: boolean;
  isCurrentRow: boolean;
  isDraggingCell: boolean;
  dragCellIndex?: number;
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
  isDraggingCell: boolean,
  index: number,
  dragCellIndex?: number,
  hoverPosition?: number
): number => {
  if (!isOver || hoverPosition === undefined) {
    return 0;
  }

  if (isCurrentRow && isDraggingCell && dragCellIndex !== undefined) {
    if (index === dragCellIndex) {
      return width * (hoverPosition - index);
    }

    if (dragCellIndex > index) {
      if (index < hoverPosition) {
        return 0;
      }

      return width;
    }

    if (dragCellIndex < index) {
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

export const useCellDragAnimation: CellDragAnimation = ({
  width,
  isDragging,
  isOver,
  isCurrentRow,
  isDraggingCell,
  dragCellIndex,
  index,
  hoverPosition,
}) => {
  const { isDragging: ctxDragging } = useDragContext();

  const x = calculateX(
    width,
    isOver,
    isCurrentRow,
    isDraggingCell,
    index,
    dragCellIndex,
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
