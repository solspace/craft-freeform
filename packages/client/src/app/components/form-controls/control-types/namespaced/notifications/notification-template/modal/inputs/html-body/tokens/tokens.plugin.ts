import type { TinyMCE } from 'tinymce';

import { hide, show } from './operations/dropdown';

export const registerFormTokens = (tinymce: TinyMCE): void => {
  // Register the plugin

  tinymce.PluginManager.add('freeform-tokens', (editor) => {
    // Listen for '@' key press
    editor.on('keydown', (e) => {
      if (e.key === '@') {
        setTimeout(() => {
          // Show dropdown at cursor position
          show(editor);
        }, 0);
      }
    });

    // Clean up when editor is removed
    editor.on('remove', () => {
      hide();
    });
  });
};
