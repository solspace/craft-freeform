import type { FC } from 'react';
import React from 'react';
import Skeleton from 'react-loading-skeleton';

import { EditorWrapper } from './editor.styles';

export const EditorLoader: FC = () => {
  return (
    <EditorWrapper>
      <div>
        <Skeleton width={80} />
        <Skeleton width={'100%'} height={30} />
      </div>

      <div>
        <Skeleton width={180} />
        <Skeleton width={'100%'} height={60} />
      </div>
    </EditorWrapper>
  );
};
