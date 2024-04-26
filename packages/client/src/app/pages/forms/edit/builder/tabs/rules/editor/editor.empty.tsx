import React from 'react';

import { RulesEditorWrapper } from './field.editor.styles';

export const RulesEmpty: React.FC = () => {
  return (
    <RulesEditorWrapper>
      Please choose a field in the left panel
    </RulesEditorWrapper>
  );
};
