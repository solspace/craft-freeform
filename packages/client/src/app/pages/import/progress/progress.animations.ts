import type { SpringValues } from 'react-spring';
import { useSpring } from 'react-spring';

export const useProgressAnimation = (
  loading: boolean
): SpringValues<{ opacity: number }> =>
  useSpring({
    opacity: loading ? 1 : 0,
    scaleY: loading ? 1 : 0,
    height: loading ? 50 : 0,
    config: {
      tension: 400,
    },
  });
