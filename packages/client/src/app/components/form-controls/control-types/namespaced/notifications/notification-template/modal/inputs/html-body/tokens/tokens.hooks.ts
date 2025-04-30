import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import type { Editor } from 'tinymce';

import type { Suggestion, SuggestionCategory } from './operations/suggestions';
import { getSuggestions } from './operations/suggestions';

type FilteredSuggestions = (
  editor: Editor,
  index: number
) => {
  suggestions: SuggestionCategory[];
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
};

export const useFilteredSuggestions: FilteredSuggestions = (editor, index) => {
  const store = editor.getParam('store');

  const [suggestions, setSuggestions] = useState<SuggestionCategory[]>([]);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const allSuggestions = getSuggestions(store);
    if (!allSuggestions.length) {
      return;
    }

    let currentIndex = 0;

    const filteredSuggestions = allSuggestions
      .map((category) => ({
        ...category,
        items: category.items
          .filter((item) =>
            item.token.toLowerCase().includes(filter.toLowerCase())
          )
          .map((item) => ({
            ...item,
            active: index === currentIndex++,
          })),
      }))
      .filter((category) => category.items.length > 0);

    setSuggestions(filteredSuggestions);
  }, [filter, index]);

  return {
    suggestions,
    filter,
    setFilter,
  };
};

type KeyboardEvents = (
  editor: Editor,
  insert: (item: Suggestion) => void,
  setIndex: Dispatch<SetStateAction<number>>
) => void;

export const useKeyboardEvents: KeyboardEvents = (editor, insert, setIndex) => {
  useEffect(() => {
    if (!editor) {
      return;
    }

    const keyDown = (event: KeyboardEvent): void => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          close();

          break;

        case 'Backspace':
          setFilter((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));

          break;

        case 'ArrowDown':
          event.preventDefault();
          if (index < itemCountRef.current - 1) {
            setIndex((prev) =>
              prev < itemCountRef.current ? prev + 1 : itemCountRef.current - 1
            );
          }

          break;

        case 'ArrowUp':
          event.preventDefault();
          if (index > 0) {
            setIndex((prev) => (prev > 0 ? prev - 1 : 0));
          }

          break;

        case 'Enter':
          event.preventDefault();
          if (index > -1) {
            const item = suggestions
              .flatMap((category) => category.items)
              .find((item) => item.active);

            if (item) {
              insert(item);
            }
          }
          setFilter('');
          close();

          break;

        default:
          if (event.key.length === 1) {
            setFilter((prev) => prev + event.key);
          }
          break;
      }
    };

    editor.on('keydown', keyDown);

    return () => {
      editor.off('keydown', keyDown);
    };
  }, [index, close, editor, suggestions]);
};
