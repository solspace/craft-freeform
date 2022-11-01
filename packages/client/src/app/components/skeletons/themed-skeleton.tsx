import type { ReactNode } from 'react';
import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';

type Props = {
  children?: ReactNode;
};

export const ThemedSkeleton: React.FC<Props> = ({ children }) => {
  return (
    <SkeletonTheme baseColor="#e6eaee" highlightColor="#ced1d4">
      {children}
    </SkeletonTheme>
  );
};
