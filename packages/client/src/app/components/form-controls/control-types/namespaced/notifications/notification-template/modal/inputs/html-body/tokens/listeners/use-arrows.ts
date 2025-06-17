import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { useEffect } from 'react';
import type {
  Suggestion,
  SuggestionCategory,
} from '@ff-client/types/notifications';
import type { Editor } from 'tinymce';

type Props = {
  editor: Editor;
  index: number;
  filter: string;
  setIndex: Dispatch<SetStateAction<number>>;
  setFilter: Dispatch<SetStateAction<string>>;
  itemCountRef: MutableRefObject<number>;
  suggestions: SuggestionCategory[];
  insert: (item: Suggestion, filter: string) => void;
  close: () => void;
};

export const useArrowNavigation = ({
  editor,
  index,
  filter,
  setIndex,
  setFilter,
  itemCountRef,
  suggestions,
  insert,
  close,
}: Props): void => {
  useEffect(() => {
    if (!editor) {
      return;
    }

    const keyDown = (event: KeyboardEvent): void | boolean => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          close();

          break;

        case 'ArrowRight':
        case 'ArrowLeft':
          event.preventDefault();
          close();

          break;

        case 'ArrowDown':
          event.preventDefault();

          setIndex((prev) => {
            if (prev >= itemCountRef.current - 1) {
              return itemCountRef.current - 1;
            }

            return prev < itemCountRef.current
              ? prev + 1
              : itemCountRef.current - 1;
          });

          break;

        case 'ArrowUp':
          event.preventDefault();
          if (index > 0) {
            setIndex((prev) => {
              if (prev > itemCountRef.current - 1) {
                return itemCountRef.current - 1;
              }

              return prev > 0 ? prev - 1 : 0;
            });
          }

          break;

        case 'Enter':
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          if (index > -1) {
            const item = suggestions
              .flatMap((category) => category.items)
              .find((item) => item.active);

            if (item) {
              insert(item, filter);
            }
          }
          setFilter('');
          close();

          return false;

        default:
          if (event.key.length === 1) {
            setFilter((prev) => prev + event.key);
          }
          break;
      }
    };

    editor.on('keydown', keyDown, true);

    return () => {
      editor.off('keydown', keyDown);
    };
  }, [index, close, editor, suggestions]);
};
