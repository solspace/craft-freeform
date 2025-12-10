import type { FC } from 'react';
import React from 'react';
import { EmptyBlock } from '@components/empty-block/empty-block';
import translate from '@ff-client/utils/translations';

import EditorIcon from './editor.icon.svg';
import { EditorContainer, EditorWrapper } from './editor.styles';

export const AbTestsEmptyView: FC = () => {
  return (
    <EditorContainer>
      <EditorWrapper>
        <EmptyBlock
          title={translate('Please select an A/B Test group')}
          subtitle={translate(
            'To add a new A/B Test Group, create it from the sidebar.'
          )}
          icon={<EditorIcon />}
        />
      </EditorWrapper>
    </EditorContainer>
  );
};
