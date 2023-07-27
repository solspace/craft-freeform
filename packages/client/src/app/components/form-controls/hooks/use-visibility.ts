import { useMemo } from 'react';
import type {
  GenericValue,
  VisibilityFilter,
} from '@ff-client/types/properties';

export const useVisibility = (
  filters: VisibilityFilter[],
  values: GenericValue[]
): boolean => {
  return useMemo(() => {
    if (filters.length === 0) {
      return true;
    }

    try {
      let visible = true;

      filters.forEach((filter) => {
        const func = new Function(...Object.keys(values), `return ${filter}`);
        const isValid = func(...Object.values(values));

        if (!isValid) {
          visible = false;
        }
      });

      return visible;
    } catch (error) {
      console.error(
        `Failed to evaluate visibility expression: ${filters.join(' && ')}`
      );

      return false;
    }
  }, [filters, values]);
};
