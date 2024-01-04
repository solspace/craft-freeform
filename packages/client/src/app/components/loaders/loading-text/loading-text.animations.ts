import type { SpringConfig, SpringValues } from 'react-spring';
import { useSpring } from 'react-spring';

import type { Dimensions } from './loading-text';

const config: SpringConfig = {
  tension: 300,
};

export const useSpinnerAnimation = (
  loading: boolean,
  instant: boolean
): SpringValues<{ width: number; opacity: number }> =>
  useSpring({
    width: loading ? 21 : 0,
    opacity: loading ? 1 : 0,
    immediate: instant,
    config,
  });

export const useDotAnimation = (
  loading: boolean,
  instant: boolean,
  xl?: boolean
): SpringValues<{ width: number; opacity: number }> =>
  useSpring({
    width: loading ? (xl ? 30 : 15) : 0,
    opacity: loading ? 1 : 0,
    immediate: instant,
    config,
  });

export const useTextContainerAnimation = (
  loading: boolean,
  loadingText: string | undefined,
  dimensions: Dimensions,
  instant: boolean
): SpringValues<{ width: number; height: number }> =>
  useSpring({
    width:
      loading && !!loadingText
        ? dimensions.loading.width
        : dimensions.original.width,
    height: dimensions.original.height,
    immediate: instant,
    config,
  });

export const useTextAnimation = (
  loading: boolean,
  loadingText: string | undefined,
  instant: boolean
): SpringValues<{ opacity: number; transform: string }> =>
  useSpring({
    opacity: loading && !!loadingText ? 0 : 1,
    transform:
      loading && !!loadingText ? 'translateY(-30px)' : 'translateY(0px)',
    immediate: instant,
    cancel: !loadingText,
    config,
  });

export const useReverseTextAnimation = (
  loading: boolean,
  instant: boolean
): SpringValues<{ opacity: number; transform: string }> =>
  useSpring({
    opacity: loading ? 1 : 0,
    transform: loading ? 'translateY(0px)' : 'translateY(30px)',
    immediate: instant,
    config,
  });
