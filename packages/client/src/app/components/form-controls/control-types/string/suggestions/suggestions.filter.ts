import type { EnvironmentSuggestionCategories } from "@ff-client/queries/autosuggest";
import { useMemo } from "react";

export const useFilteredSuggestions = (
  suggestions: EnvironmentSuggestionCategories,
  filter?: string,
): EnvironmentSuggestionCategories => {
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
