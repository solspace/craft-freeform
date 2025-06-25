import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import type { SuggestionCategory } from '@ff-client/types/notifications';

import type { TokenBackend } from '../tokens.types';

import { useSuggestions } from './suggestions';

type FilteredSuggestions = (
  backend: TokenBackend,
  index: number
) => {
  suggestions: SuggestionCategory[];
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
};

export const useFilteredSuggestions: FilteredSuggestions = (backend, index) => {
  const allSuggestions = useSuggestions(backend);
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
