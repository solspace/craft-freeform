import type { SpringValues } from 'react-spring';
import { useSpring } from 'react-spring';

export const useProgressAnimation = (
  loading: boolean
): SpringValues<{ opacity: number }> =>
  useSpring({
    opacity: loading ? 1 : 0,
    scaleY: loading ? 1 : 0,
    height: loading ? 100 : 0,
    config: {
      tension: 400,
    },
  });

export const useDoneAnimation = (
  show: boolean
): SpringValues<{ opacity: number }> =>
  useSpring({
    opacity: show ? 1 : 0,
    scaleY: show ? 1 : 0,
    height: show ? 40 : 0,
    config: {
      tension: 400,
    },
  });
