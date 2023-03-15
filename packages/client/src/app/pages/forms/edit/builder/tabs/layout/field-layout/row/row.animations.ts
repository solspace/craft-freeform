import type { SpringValue } from 'react-spring';
import { useSpring } from 'react-spring';

type MountAnimation = {
  opacity: SpringValue<number>;
  minHeight: SpringValue<number>;
  transform: SpringValue<string>;
};

export const useOnMountAnimation = (): MountAnimation => {
  return useSpring({
    from: {
      opacity: 0,
      minHeight: 1,
      transform: 'scaleY(0)',
    },
    to: {
      opacity: 1,
      minHeight: 72,
      transform: 'scaleY(1)',
    },
    config: {
      friction: 11,
      tension: 100,
      mass: 0.5,
    },
  });
};

type PlaceholderAnimation = {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
};

export const usePlaceholderAnimation = (
  isOver: boolean
): PlaceholderAnimation => {
  return useSpring({
    to: {
      opacity: isOver ? 1 : 0,
      transform: isOver ? `scaleY(1)` : `scaleY(0)`,
    },
    delay: isOver ? 200 : 0,
    config: {
      tension: 500,
    },
  });
};

type RowAnimation = {
  y: SpringValue<number>;
};

export const useRowAnimation = (isOver: boolean): RowAnimation =>
  useSpring({
    to: {
      y: isOver ? 10 : 0,
    },
    delay: isOver ? 200 : 0,
    config: {
      tension: 300,
    },
  });
