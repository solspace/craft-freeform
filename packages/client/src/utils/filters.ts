import type { GenericValue } from '@ff-client/types/properties';

export const filterTest = (
  filters: string[],
  values: GenericValue
): boolean => {
  let matchesFilters = true;

  filters.forEach((filter) => {
    const func = new Function(...Object.keys(values), `return ${filter}`);
    const isValid = func(...Object.values(values));

    if (!isValid) {
      matchesFilters = false;
    }
  });

  return matchesFilters;
};
