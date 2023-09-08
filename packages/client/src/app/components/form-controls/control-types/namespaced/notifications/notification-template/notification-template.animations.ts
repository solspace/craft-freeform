import type { SpringValues } from 'react-spring';
import { useSpring } from 'react-spring';

export const useEditorAnimations = (
  open: boolean,
  itemCount: number
): SpringValues<{ height: number }> => {
  let height = 210;
  if (itemCount > 6) {
    height = 360;
  } else if (itemCount > 3) {
    height = 280;
  }

  return useSpring({
    height: open ? height : 36,
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
