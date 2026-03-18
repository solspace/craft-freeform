import type { SpringValues } from "@react-spring/web";
import { useSpring } from "@react-spring/web";

export const useLoaderAnimation = (
  isLoading: boolean,
): [SpringValues<{ scale: number }>, SpringValues<{ scale: number }>] => {
  const spinner = useSpring({
    scale: isLoading ? 1 : 0.3,
    opacity: isLoading ? 1 : 0,
  });

  const icon = useSpring({
    scale: isLoading ? 0.3 : 1,
    opacity: isLoading ? 0 : 1,
  });

  return [spinner, icon];
};
