import { useMemo } from 'react';
import type {
  GenericValue,
  VisibilityFilter,
} from '@ff-client/types/properties';
import { filterTest } from '@ff-client/utils/filters';

export const useVisibility = (
  filters: VisibilityFilter[],
  values: GenericValue[]
): boolean => {
  return useMemo(() => {
    if (filters.length === 0) {
      return true;
    }

    try {
      return filterTest(filters, values);
    } catch (error) {
      console.error(
        `Failed to evaluate visibility expression: ${filters.join(' && ')}`
      );

      return false;
    }
  }, [filters, values]);
};
