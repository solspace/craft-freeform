import type { SpringValue } from 'react-spring';
import { useSpring } from 'react-spring';
import { colors } from '@ff-client/styles/variables';

type EditButtonAnimation = {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
};

export const useEditButtonAnimations = (
  hover: boolean
): EditButtonAnimation => {
  return useSpring({
    opacity: hover ? 1 : 0,
    transform: hover ? 'rotate(0deg)' : 'rotate(-30deg)',
    config: {
      tension: 500,
    },
  });
};

type BackgroundAnimation = {
  backgroundColor: SpringValue<string>;
};

export const useLabelAnimation = (hover: boolean): BackgroundAnimation => {
  return useSpring({
    backgroundColor: hover ? colors.gray050 : colors.white,
    config: {
      tension: 500,
    },
  });
};
