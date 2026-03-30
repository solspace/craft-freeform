import type { GenericValue } from "@ff-client/types/properties";

export const range = (min: number, max?: number): number[] => {
  if (max === undefined) {
    if (min > 1) {
      max = min;
      min = 1;
    } else {
      max = min;
      min = 0;
    }
  }

  const range: number[] = [];
  for (let i = min; i <= max; i++) {
    range.push(i);
  }

  return range;
};

export const indexedColumn = <T>(
  items: Array<T>,
  index: keyof T | ((item: T) => GenericValue),
  column?: keyof T | ((item: T) => GenericValue),
): Record<string | number, T | GenericValue> => {
  const indexed: Record<string | number, GenericValue> = {};

  items.forEach((item) => {
    const key = typeof index === "function" ? index(item) : item[index];

    let columnValue: GenericValue | T;
    if (column === undefined) {
      columnValue = item;
    } else if (typeof column === "function") {
      columnValue = column(item);
    } else {
      columnValue = item[column];
    }

    indexed[key] = columnValue;
  });

  return indexed;
};
