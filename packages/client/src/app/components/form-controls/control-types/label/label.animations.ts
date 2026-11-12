import type { SpringValue } from "@react-spring/web";
import { useSpring } from "@react-spring/web";

type EditButtonAnimation = {
  opacity: SpringValue<number>;
  transform: SpringValue<string>;
};

export const useEditButtonAnimations = (
  hover: boolean,
): EditButtonAnimation => {
  return useSpring({
    opacity: hover ? 1 : 0,
    transform: hover ? "rotate(0deg)" : "rotate(-30deg)",
    config: {
      tension: 500,
    },
  });
};
