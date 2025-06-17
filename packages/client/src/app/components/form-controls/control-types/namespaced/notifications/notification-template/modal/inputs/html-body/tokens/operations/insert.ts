import type { Suggestion } from '@ff-client/types/notifications';
import type { Editor } from 'tinymce';

export const insertToken =
  (editor: Editor) =>
  (item: Suggestion, filter: string): void => {
    const rng = editor.selection.getRng();
    const startOffset = Math.max(0, rng.startOffset - (filter.length + 1));
    rng.setStart(rng.startContainer, startOffset);
    editor.selection.setRng(rng);
    editor.execCommand('Delete');

    editor.insertContent(
      `<span contenteditable="false" data-freeform-token="${item.token}">${item.name}</span>&nbsp;`
    );
  };
