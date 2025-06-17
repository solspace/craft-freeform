import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import type { SuggestionCategory } from '@ff-client/types/notifications';
import type { Editor } from 'tinymce';

import { useSuggestions } from './suggestions';

type FilteredSuggestions = (
  editor: Editor,
  index: number
) => {
  suggestions: SuggestionCategory[];
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
};

export const useFilteredSuggestions: FilteredSuggestions = (editor, index) => {
  const allSuggestions = useSuggestions(editor);
  const [suggestions, setSuggestions] = useState<SuggestionCategory[]>([]);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    let currentIndex = 0;

    const filteredSuggestions = allSuggestions
      .map((category) => ({
        ...category,
        items: category.items
          .filter((item) =>
            item.name.toLowerCase().includes(filter.toLowerCase())
          )
          .map((item) => ({
            ...item,
            active: index === currentIndex++,
          })),
      }))
      .filter((category) => category.items.length > 0);

    setSuggestions(filteredSuggestions);
  }, [allSuggestions, filter, index]);

  return {
    suggestions,
    filter,
    setFilter,
  };
};
