import React from 'react';
import { Control } from '@components/form-controls/control';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import type { ControlType } from '@components/form-controls/types';
import type { CodeEditorProperty } from '@ff-client/types/properties';

import { CodeEditor } from './code.editor';
import { CodePreview } from './code.preview';

const Code: React.FC<ControlType<CodeEditorProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const { handle, language } = property;

  return (
    <Control property={property} errors={errors}>
      <PreviewableComponent preview={<CodePreview value={value} />}>
        <CodeEditor
          value={value}
          language={language}
          updateValue={updateValue}
        />
      </PreviewableComponent>
    </Control>
  );
};

export default Code;
