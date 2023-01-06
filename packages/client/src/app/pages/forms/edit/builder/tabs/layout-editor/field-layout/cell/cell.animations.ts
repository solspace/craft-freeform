import type { SpringValue } from 'react-spring';
import { useSpring } from 'react-spring';

type CellDragAnimation = {
  width: SpringValue<number>;
  x: SpringValue<number>;
};

export const useCellDragAnimation = (
  width: number,
  offsetPx: number
): CellDragAnimation => {
  const style = useSpring({
    to: {
      width,
      x: offsetPx || 0,
    },
    config: {
      tension: 700,
      mass: 0.5,
    },
  });

  return style;
};
