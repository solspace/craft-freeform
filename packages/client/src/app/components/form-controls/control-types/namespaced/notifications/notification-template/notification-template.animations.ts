import type { SpringValues } from 'react-spring';
import { useSpring } from 'react-spring';

export const useEditorAnimations = (
  open: boolean
): SpringValues<{ height: number }> => {
  return useSpring({
    height: open ? 400 : 36,
    config: {
      tension: 500,
      friction: open ? 26 : 40,
    },
  });
};

export const useSelectionAnimations = (
  open: boolean
): SpringValues<{ opacity: number }> => {
  return useSpring({
    opacity: open ? 1 : 0,
    overflowY: open ? 'auto' : 'hidden',
    config: {
      tension: 500,
    },
  });
};
