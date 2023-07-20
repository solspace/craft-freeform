import type { SpringValue } from 'react-spring';
import { useSpring } from 'react-spring';
import { colors } from '@ff-client/styles/variables';

type RemoveAnimation = (options: { active: boolean; hovering: boolean }) => {
  opacity: SpringValue<number>;
};

export const useRemoveAnimation: RemoveAnimation = ({ active, hovering }) => {
  const style = useSpring({
    opacity: active ? 1 : 0,
    background: hovering ? colors.error : 'transparent',
    color: hovering ? '#fff' : colors.gray300,
    scale: hovering ? 1.2 : 1,
    rotate: active ? 0 : 50,

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

  return style;
};
