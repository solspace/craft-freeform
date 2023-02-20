import type {
  Attribute,
  AttributeCollection,
  AttributeTarget,
} from './attributes.types';

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

export const addAttribute = (
  category: AttributeTarget,
  attributes: AttributeCollection
): AttributeCollection => {
  const updated = {
    ...attributes,
    [category]: [...attributes[category], ['', '']],
  };

  return updated;
};

export const updateAttribute = (
  index: number,
  category: AttributeTarget,
  attribute: Attribute,
  attributes: AttributeCollection
): AttributeCollection => {
  const updated = {
    ...attributes,
    [category]: [...attributes[category]],
  };

  updated[category][index] = attribute;

  return updated;
};

export const deleteAttribute = (
  index: number,
  category: AttributeTarget,
  attributes: AttributeCollection
): AttributeCollection => {
  return {
    ...attributes,
    [category]: [...attributes[category].filter((_, idx) => idx !== index)],
  };
};

export const cleanAttributes = (
  attributes: AttributeCollection
): AttributeCollection => {
  const updated: AttributeCollection = {};

  Object.entries(attributes).forEach(([category, attrs]) => {
    updated[category as AttributeTarget] = attrs.filter(
      ([key, value]) => !!key || !!value
    );
  });

  return updated;
};
