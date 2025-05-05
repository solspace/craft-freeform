import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import type { Editor } from 'tinymce';

import type { SuggestionCategory } from './suggestions';
import { getSuggestions } from './suggestions';

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
