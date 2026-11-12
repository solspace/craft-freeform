import type { ComponentProps, FC } from "react";
import { SkeletonTheme } from "react-loading-skeleton";

type Props = Omit<
  ComponentProps<typeof SkeletonTheme>,
  "baseColor" | "highlightColor"
>;

export const ThemedSkeleton: FC<Props> = ({ children, ...props }) => (
  <SkeletonTheme
    {...props}
    baseColor="color-mix(in srgb, var(--c-text-default) 10%, var(--c-surface-default))"
    highlightColor="color-mix(in srgb, var(--c-text-default) 18%, var(--c-surface-default))"
  >
    {children}
  </SkeletonTheme>
);
