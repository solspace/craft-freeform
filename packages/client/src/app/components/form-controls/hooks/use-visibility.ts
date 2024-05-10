import { useMemo } from 'react';
import config from '@config/freeform/freeform.config';
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

    const context = { config };

    try {
      return filterTest(filters, values, context);
    } catch (error) {
      console.error(
        `Failed to evaluate visibility expression: ${filters.join(' && ')}`
      );

      return false;
    }
  }, [filters, values]);
};
