import type { TinyMCE } from 'tinymce';

import { hide, show } from './operations/dropdown';

export const registerFormTokens = (tinymce: TinyMCE): void => {
  // Register the plugin

  tinymce.PluginManager.add('freeform-tokens', (editor) => {
    // Listen for '@' key press
    editor.on('keydown', (e) => {
      if (e.key === '@') {
        setTimeout(() => {
          const selection = editor.selection;
          const range = selection.getRng();
          const rect = range.getBoundingClientRect();

          // Show dropdown at cursor position
          show(editor, rect);
        }, 0);
      }
    });

    // Clean up when editor is removed
    editor.on('remove', () => {
      hide();
    });
  });
};
