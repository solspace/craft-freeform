import type { SpringValues } from 'react-spring';
import { useChain, useSpring, useSpringRef, useTrail } from 'react-spring';

type SpringReturnType = {
  opacity?: number;
  scale?: number;
  x?: number;
  y?: number;
};

type UseLogoAnimation = {
  installed: {
    icon: SpringValues<SpringReturnType>;
    text: SpringValues<SpringReturnType>;
  };
  extra: SpringValues<SpringReturnType>;
  buttons: SpringValues<SpringReturnType>[];
};

export const useWelcomeAnimations = (): UseLogoAnimation => {
  const icon = useSpring({
    from: { opacity: 0, scale: 0.5 },
    to: { opacity: 1, scale: 1 },
    delay: 1000,
  });

  const textRef = useSpringRef();
  const text = useSpring({
    ref: textRef,
    from: { opacity: 0, y: 10 },
    to: { opacity: 1, y: 0 },
    delay: 1000,
  });

  const extraRef = useSpringRef();
  const extra = useSpring({
    ref: extraRef,
    from: { opacity: 0, y: 10 },
    to: { opacity: 1, y: 0 },
  });

  const buttonsRef = useSpringRef();
  const buttons = useTrail(4, {
    ref: buttonsRef,
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
  });

  useChain([textRef, extraRef, buttonsRef], [0, 2, 2.2]);

  return {
    installed: {
      icon,
      text,
    },
    extra,
    buttons,
  };
};
