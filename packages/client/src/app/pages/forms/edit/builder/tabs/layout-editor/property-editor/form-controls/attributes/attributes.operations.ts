import type { Attribute } from './attributes.types';

type ParsedAttribute = [string, string | undefined];

export const attributesToArray = (
  attributes: Attribute[]
): ParsedAttribute[] => {
  const parsed: ParsedAttribute[] = [];

  attributes.forEach(([key, value]) => {
    key = null === key ? '' : key;
    value = null === value ? '' : value;

    if (!key && value) {
      key = value;
      value = '';
    }

    if ((!key && !value) || value === false) {
      return;
    }

    if (value === true || value === '' || value === null) {
      return parsed.push([String(key), undefined]);
    }

    if (Array.isArray(value)) {
      value = value.join(' ');
    }

    return parsed.push([String(key), String(value)]);
  });

  return parsed;
};

export const attributesToString = (attributes: Attribute[]): string => {
  return attributesToArray(attributes)
    .map(([key, value]) => `${key}${value !== undefined ? `="${value}"` : ''}`)
    .join(' ');
};
