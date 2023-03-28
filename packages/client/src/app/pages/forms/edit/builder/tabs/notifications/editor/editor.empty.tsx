import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { ThemedSkeleton } from '@ff-client/app/components/skeletons/themed-skeleton';
import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { PropertyEditorWrapper } from './editor.styles';

export const Inline = styled.div`
  display: flex;
  gap: ${spacings.md};
`;

export const EmptyEditor: React.FC = () => {
  return (
    <PropertyEditorWrapper>
      <ThemedSkeleton>
        <div>
          <Skeleton width={100} height={10} />
          <Skeleton width="100%" height={25} />
        </div>
        <Inline>
          <Skeleton width={14} height={14} />
          <Skeleton width={150} height={14} />
        </Inline>
        <div>
          <Skeleton width={200} height={10} />
          <Skeleton width={500} height={10} />
          <Skeleton height={30} />
        </div>
        <div>
          <Skeleton width={150} height={10} />
          <Skeleton width={300} height={10} />
          <Skeleton height={30} />
        </div>
      </ThemedSkeleton>
    </PropertyEditorWrapper>
  );
};
