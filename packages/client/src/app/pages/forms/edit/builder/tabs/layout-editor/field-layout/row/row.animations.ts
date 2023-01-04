import type { SpringValue } from 'react-spring';
import { useSpring } from 'react-spring';

type MountAnimation = {
  opacity: SpringValue<number>;
  height: SpringValue<number>;
  transform: SpringValue<string>;
};

export const useOnMountAnimation = (): MountAnimation => {
  return useSpring({
    from: {
      opacity: 0,
      height: 1,
      transform: 'scaleY(0)',
    },
    to: {
      opacity: 1,
      height: 72,
      transform: 'scaleY(1)',
    },
    config: {
      friction: 11,
      tension: 100,
      mass: 0.5,
    },
  });
};
