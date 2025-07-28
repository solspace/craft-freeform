import { useMemo } from 'react';

import type { SuggestionCategory } from './suggestions';

export const useFilteredSuggestions = (
  suggestions: SuggestionCategory[],
  filter?: string
): SuggestionCategory[] => {
  const filtered = useMemo(() => {
    if (!suggestions || suggestions.length === 0) {
      return [];
    }

    if (!filter) {
      return suggestions;
    }

    return suggestions
      .map((category) => {
        const data = category.data.filter((suggestion) => {
          if (!filter) {
            return true;
          }
          return suggestion.name.toLowerCase().includes(filter.toLowerCase());
        });

        return {
          ...category,
          data,
        };
      })
      .filter((category) => category.data.length > 0);
  }, [suggestions, filter]);

  return filtered;
};
