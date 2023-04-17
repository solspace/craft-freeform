import React from 'react';

import { Editor } from './editor/editor';
import { List } from './sidebar/list';
import { RulesWrapper } from './rules.styles';

export const Rules: React.FC = () => {
  return (
    <RulesWrapper>
      <List />
      <Editor />
    </RulesWrapper>
  );
};
