import type { SpringValue } from "@react-spring/web";
import { useSpring } from "@react-spring/web";

type RemoveAnimation = (options: { active: boolean }) => {
  opacity: SpringValue<number>;
};

export const useRemoveAnimation: RemoveAnimation = ({ active }) => {
  return useSpring({
    opacity: active ? 1 : 0,
    rotate: active ? 0 : 30,

    config: { tension: 330, friction: 15 },
  });
};
