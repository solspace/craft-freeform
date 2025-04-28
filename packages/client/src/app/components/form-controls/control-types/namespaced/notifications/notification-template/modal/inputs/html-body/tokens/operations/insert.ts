import type { Editor } from 'tinymce';

import { getSuggestions } from './suggestions';

export const insertToken = (editor: Editor, value: string): void => {
  const store = editor.getParam('store');
  const suggestions = getSuggestions(store);
  const text = suggestions.find((item) => item.value === value)?.text || value;

  editor.insertContent(
    `<span contenteditable="false" data-freeform-token="${value}">${text}</span>&nbsp;`
  );
};
