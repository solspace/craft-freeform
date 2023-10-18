import type { SpringValues } from 'react-spring';
import { useChain, useSpring, useSpringRef, useTrail } from 'react-spring';

type SpringReturnType = {
  opacity?: number;
  scale?: number;
  x?: number;
  y?: number;
};

type TrailReturnType = SpringValues<{
  opacity: number;
  x: number;
  y: number;
}>;

type UseLogoAnimation = {
  background: SpringValues<SpringReturnType>;
  border: SpringValues<SpringReturnType>;
  lines: TrailReturnType[];
  check: SpringValues<SpringReturnType>;
  pencil: SpringValues<SpringReturnType>;
  letters: SpringValues<SpringReturnType>[];
};

export const useLogoAnimation = (): UseLogoAnimation => {
  const background = useSpring({
    from: { opacity: 0, scale: 0 },
    to: { opacity: 1, scale: 1 },
  });

  const borderRef = useSpringRef();
  const border = useSpring({
    ref: borderRef,
    from: { opacity: 0, scale: 0 },
    to: { opacity: 1, scale: 1 },
    config: {
      tension: 300,
    },
  });

  const linesRef = useSpringRef();
  const lines = useTrail(5, {
    ref: linesRef,
    from: { opacity: 0, x: -30, y: 10 },
    to: { opacity: 1, x: 0, y: 0 },
    config: {
      tension: 300,
    },
  });

  const checkRef = useSpringRef();
  const check = useSpring({
    ref: checkRef,
    from: { opacity: 0, scale: 0, x: -30, y: 10 },
    to: { opacity: 1, scale: 1, x: 0, y: 0 },
    config: {
      tension: 200,
    },
  });

  const pencilRef = useSpringRef();
  const pencil = useSpring({
    ref: pencilRef,
    from: { opacity: 0, scale: 0.6, x: 30, y: -40 },
    to: { opacity: 1, scale: 1, x: 0, y: 0 },
    config: {
      tension: 130,
    },
  });

  const lettersRef = useSpringRef();
  const letters = useTrail(8, {
    ref: lettersRef,
    from: { opacity: 0, scale: 1.05 },
    to: { opacity: 1, scale: 1 },
  });

  useChain(
    [borderRef, linesRef, checkRef, pencilRef, lettersRef],
    [0, 0.8, 0.6, 1, 0.8]
  );

  return {
    background,
    border,
    lines,
    check,
    pencil,
    letters,
  };
};
