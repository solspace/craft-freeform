import type { Editor } from 'tinymce';

import type { TokenAPI } from '../tokens.dropdown';
import { renderTokenDropdown } from '../tokens.dropdown';

let api: TokenAPI;

export const show = (editor: Editor): void => {
  hide();
  api = renderTokenDropdown(editor);
};

export const hide = (): void => {
  if (api) {
    api.close();
    api = undefined;
  }
};
