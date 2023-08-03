import type { SpringValues, TransitionFn } from 'react-spring';
import { useSpring, useTransition } from 'react-spring';

import type { ModalType } from './modal.types';

export const useAnimateOverlay = (
  active: boolean
): SpringValues<{ opacity: number; backgroundColor: string }> =>
  useSpring({
    to: {
      opacity: active ? 1 : 0,
      backgroundColor: active
        ? 'rgba(123, 135, 147, 0.35)'
        : 'rgba(123, 135, 147, 0)',
    },
  });

export const useAnimateModals = (
  modals: ModalType[]
): TransitionFn<ModalType, { y: number; opacity: number }> => {
  return useTransition(modals, {
    from: {
      y: 100,
      opacity: 0,
    },
    enter: {
      y: 0,
      opacity: 1,
    },
    leave: {
      y: -100,
      opacity: 0,
    },
    config: {
      tension: 500,
      friction: 20,
    },
  });
};
