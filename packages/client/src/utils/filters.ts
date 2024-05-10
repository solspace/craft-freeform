import type { GenericValue } from '@ff-client/types/properties';

export const filterTest = (
  filters: string[],
  values: GenericValue,
  context?: Record<string, unknown>
): boolean => {
  let matchesFilters = true;

  filters.forEach((filter) => {
    const func = new Function(
      ...Object.keys(values),
      'context',
      `return ${filter}`
    );

    const isValid = func(...Object.values(values), context);

    if (!isValid) {
      matchesFilters = false;
    }
  });

  return matchesFilters;
};
