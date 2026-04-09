import type { Suggestion } from "@ff-client/types/notifications";
import type { TinyMCE } from "tinymce";

import { hide, show } from "./operations/dropdown";
import type { TokenBackend } from "./tokens.types";

let isRegistered = false;

export const registerFormTokens = (tinymce: TinyMCE): void => {
  if (isRegistered) {
    return;
  }

  isRegistered = true;

  // Register the plugin
  tinymce.PluginManager.add("freeform-tokens", (editor) => {
    const backend: TokenBackend = {
      store: editor.getParam("store"),

      getRect: () => editor.getContentAreaContainer().getBoundingClientRect(),
      getRange: () => editor.selection.getRng(),
      insert: (item: Suggestion, filter: string): void => {
        const rng = editor.selection.getRng();
        const startOffset = Math.max(0, rng.startOffset - (filter.length + 1));
        rng.setStart(rng.startContainer, startOffset);
        editor.selection.setRng(rng);
        editor.execCommand("Delete");

        editor.insertContent(
          `<span contenteditable="false" data-freeform-token="${item.token}">${item.name}</span>`,
        );
      },

      handlers: {
        on: {
          down: (callback, prepend = false) => {
            editor.on("keydown", callback, prepend);
          },
          up: (callback, prepend = false) => {
            editor.on("keyup", callback, prepend);
          },
        },
        off: {
          down: (callback) => {
            editor.off("keydown", callback);
          },
          up: (callback) => {
            editor.off("keyup", callback);
          },
        },
      },
    };

    // Listen for '@' key press
    editor.on("keydown", (e) => {
      if (e.key === "@") {
        setTimeout(() => {
          // Show dropdown at cursor position
          show(backend);
        }, 0);
      }
    });

    // Clean up when editor is removed
    editor.on("remove", () => {
      hide();
    });
  });
};
