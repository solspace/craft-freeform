import React from 'react';
import { Editor } from './editor/editor';
import { Wrapper } from './integrations.styles';
import { Sidebar } from './sidebar/sidebar';

export const Integrations: React.FC = () => {
  return (
    <Wrapper>
      <Sidebar />
      <Editor />
    </Wrapper>
  );
};
