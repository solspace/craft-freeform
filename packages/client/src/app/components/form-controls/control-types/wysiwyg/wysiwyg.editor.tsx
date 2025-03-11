import React, { useEffect, useRef } from 'react';
import {
  PreviewContainer,
  PreviewEditor,
} from '@components/form-controls/preview/previewable-component.styles';
import type { PellElement } from 'pell';
import pell from 'pell';

import { compileActions } from './wysiwyg.actions';
import { WysiwygEditorWrapper } from './wysiwyg.editor.styles';

import 'pell/dist/pell.min.css';

type Props = {
  value: string;
  updateValue: (value: string) => void;
  actions: string[];
};

export const WysiwygEditor: React.FC<Props> = ({
  value,
  actions,
  updateValue,
}) => {
  const editor = useRef<HTMLDivElement>(null);
  const instance = useRef<PellElement>(null);

  useEffect(() => {
    if (!editor.current) {
      return;
    }

    instance.current = pell.init({
      element: editor.current,
      onChange: updateValue,
      defaultParagraphSeparator: 'p',
      actions: compileActions(actions),
    });

    const content = editor.current.querySelector('.pell-content');
    if (content) {
      content.innerHTML = value;
    }

    return () => {
      if (editor.current) {
        editor.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    if (editor.current) {
      return;
    }

    const content = editor.current.querySelector('.pell-content');
    if (content && content.innerHTML !== value) {
      content.innerHTML = value;
    }
  }, [value]);

  return (
    <PreviewEditor>
      <PreviewContainer>
        <WysiwygEditorWrapper>
          <div ref={editor} />
        </WysiwygEditorWrapper>
      </PreviewContainer>
    </PreviewEditor>
  );
};
