import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { Wrapper } from './field.styles';

export const LoaderFieldItem: React.FC = () => {
  return (
    <Wrapper>
      <SkeletonTheme>
        <Skeleton
          width={18}
          height={18}
          borderRadius="50%"
          style={{ position: 'relative', top: -2 }}
        />
        <Skeleton width={50} style={{ position: 'relative', top: -1 }} />
      </SkeletonTheme>
    </Wrapper>
  );
};
