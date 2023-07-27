import type { SpringValue } from 'react-spring';
import { useSpring } from 'react-spring';
import { colors } from '@ff-client/styles/variables';

type RemoveAnimation = (options: { hovering: boolean }) => {
  opacity: SpringValue<number>;
};

export const useRemoveAnimation: RemoveAnimation = ({ hovering }) => {
  return useSpring({
    opacity: 1,
    background: hovering ? colors.error : 'transparent',
    color: hovering ? '#fff' : colors.gray300,
    scale: hovering ? 1.2 : 1,

    config: (key) => {
      switch (key) {
        case 'background':
        case 'color':
          return {
            tension: 330,
            friction: 20,
          };

        default:
          return {
            tension: 330,
            friction: 15,
          };
      }
    },
  });
};
