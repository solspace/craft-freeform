import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';
import type { Editor } from 'tinymce';

type Props = {
  editor: Editor;
  setFilter: Dispatch<SetStateAction<string>>;
  close: () => void;
};

export const useKeyboard = ({ editor, setFilter, close }: Props): void => {
  useEffect(() => {
    if (!editor) {
      return;
    }

    const keyUp = (event: KeyboardEvent): void => {
      const selection = editor.selection;
      const rng = selection.getRng();
      const currentNode = rng.startContainer;
      const currentOffset = rng.startOffset;

      // Check if we're still in text content
      if (currentNode.nodeType === 3) {
        const textContent = currentNode.textContent;
        let searchText = '';

        // Look backwards from cursor to find '@' or determine if it was deleted
        let foundAt = false;
        for (let i = currentOffset - 1; i >= 0; i--) {
          if (textContent[i] === '@') {
            foundAt = true;
            searchText = textContent.substring(i + 1, currentOffset);
            break;
          }
        }

        if (!foundAt || event.key === 'Escape') {
          // @ was deleted or Escape was pressed, hide dropdown
          close();
          setFilter('');
        } else {
          setFilter(searchText);
        }
      } else {
        // Not in a text node anymore, hide dropdown
        close();
      }
    };

    editor.on('keyup', keyUp, true);

    return () => {
      editor.off('keyup', keyUp);
    };
  }, [close, editor, setFilter]);
};
