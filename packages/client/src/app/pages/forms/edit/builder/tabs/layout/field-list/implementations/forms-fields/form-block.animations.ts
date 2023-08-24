import { type SpringValues, useSpring } from 'react-spring';

export const useFormBlockAnimations = (
  open: boolean
): SpringValues<{ maxHeight: number }> => {
  return useSpring({
    maxHeight: open ? 200 : 0,
    paddingTop: open ? 8 : 0,
    paddingBottom: open ? 8 : 0,
    config: {
      tension: 500,
      friction: open ? 26 : 40,
    },
  });
};
