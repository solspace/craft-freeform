import type { MutableRefObject } from 'react';
import type { Editor } from 'tinymce';

type PositionHook = (
  editor: Editor,
  ref: MutableRefObject<HTMLDivElement>
) => {
  left: number;
  top: number;
};

export const usePosition: PositionHook = (editor, ref) => {
  const editorRect = editor.getContentAreaContainer().getBoundingClientRect();
  const selection = editor.selection;
  const range = selection.getRng();
  const rect = range.getBoundingClientRect();

  const left = editorRect.left + rect.left + window.scrollX + 15;
  const top = editorRect.top + rect.top + window.scrollY + 20;

  if (ref.current) {
    ref.current.style.left = `${left}px`;
    ref.current.style.top = `${top}px`;
  }

  return { left, top };
};
