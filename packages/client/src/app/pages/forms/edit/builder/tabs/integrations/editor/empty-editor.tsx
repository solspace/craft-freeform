import { ThemedSkeleton } from '@ff-client/app/components/skeletons/themed-skeleton';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { EditorWrapper } from './editor.styles';

export const EmptyEditor: React.FC = () => {
  return (
    <EditorWrapper>
      <ThemedSkeleton>
        <Skeleton width={120} height={20} />
        <br />
        <Skeleton width={100} height={10} />
        <Skeleton width={50} height={20} />
        <br />
        <Skeleton width={200} height={10} />
        <Skeleton width={500} height={10} />
        <Skeleton height={30} />
        <br />
        <Skeleton width={150} height={10} />
        <Skeleton width={300} height={10} />
        <Skeleton height={30} />
      </ThemedSkeleton>
    </EditorWrapper>
  );
};
