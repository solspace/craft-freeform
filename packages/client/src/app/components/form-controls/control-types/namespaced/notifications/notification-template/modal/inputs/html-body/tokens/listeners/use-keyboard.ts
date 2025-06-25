import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';

import type { TokenBackend } from '../tokens.types';

type Props = {
  backend: TokenBackend;
  setFilter: Dispatch<SetStateAction<string>>;
  close: () => void;
};

export const useKeyboard = ({ backend, setFilter, close }: Props): void => {
  useEffect(() => {
    if (backend.extrnalTrigger) {
      return;
    }

    const keyUp = (event: KeyboardEvent): void => {
      const rng = backend.getRange();
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

    backend.handlers.on.up(keyUp, true);

    return () => {
      backend.handlers.off.up(keyUp);
    };
  }, [close, backend, setFilter]);
};
