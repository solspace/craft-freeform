import React from 'react';
import {
  PreviewContainer,
  PreviewEditor,
} from '@components/form-controls/preview/previewable-component.styles';
import { Editor } from '@monaco-editor/react';

type Props = {
  value: string;
  language: string;
  updateValue: (value: string) => void;
};

export const CodeEditor: React.FC<Props> = ({
  value,
  language,
  updateValue,
}) => {
  return (
    <PreviewEditor>
      <PreviewContainer>
        <Editor
          height={600}
          value={value}
          defaultLanguage={language}
          onChange={updateValue}
          options={{
            scrollbar: {
              verticalScrollbarSize: 5,
              horizontalScrollbarSize: 5,
            },
          }}
        />
      </PreviewContainer>
    </PreviewEditor>
  );
};
