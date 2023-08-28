import React from 'react';
import ReactQuill from 'react-quill';
import {
  PreviewContainer,
  PreviewEditor,
} from '@components/form-controls/preview/previewable-component.styles';

import { QuillEditorWrapper } from './wysiwyg.editor.styles';

import 'react-quill/dist/quill.snow.css';

type Props = {
  value: string;
  updateValue: (value: string) => void;
};

export const WysiwygEditor: React.FC<Props> = ({ value, updateValue }) => {
  return (
    <PreviewEditor>
      <PreviewContainer>
        <QuillEditorWrapper>
          <ReactQuill
            theme="snow"
            value={value}
            onChange={updateValue}
            style={{ background: 'white' }}
          />
        </QuillEditorWrapper>
      </PreviewContainer>
    </PreviewEditor>
  );
};
