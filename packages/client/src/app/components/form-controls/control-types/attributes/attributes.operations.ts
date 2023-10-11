import type {
  AttributeEntry,
  EditableAttributeCollection,
} from './attributes.types';

type ParsedAttribute = [string, string | undefined];

export const attributesToArray = (
  attributes: AttributeEntry[]
): ParsedAttribute[] => {
  const parsed: ParsedAttribute[] = [];

  attributes.forEach(([key, value]) => {
    key = null === key ? '' : key;
    value = null === value ? '' : value;

    if (!key && value) {
      key = value;
      value = '';
    }

    if (!key && !value) {
      return;
    }

    if (value === '' || value === null) {
      return parsed.push([String(key), undefined]);
    }

    if (Array.isArray(value)) {
      value = value.join(' ');
    }

    return parsed.push([String(key), String(value)]);
  });

  return parsed;
};

export const attributesToString = (attributes: AttributeEntry[]): string => {
  return attributesToArray(attributes)
    .map(([key, value]) => `${key}${value !== undefined ? `="${value}"` : ''}`)
    .join(' ');
};

export const addAttribute = (
  category: string,
  attributes: EditableAttributeCollection,
  atIndex: number
): EditableAttributeCollection => {
  const categoryAttributes = attributes?.[category] || [];

  return {
    ...attributes,
    [category]: [
      ...categoryAttributes.slice(0, atIndex + 1),
      ['', ''],
      ...categoryAttributes.slice(atIndex + 1),
    ],
  };
};

export const updateAttribute = (
  index: number,
  category: string,
  attribute: AttributeEntry,
  attributes: EditableAttributeCollection
): EditableAttributeCollection => {
  const updated = {
    ...attributes,
    [category]: [...attributes[category]],
  };

  updated[category][index] = attribute;

  return updated;
};

export const deleteAttribute = (
  index: number,
  category: string,
  attributes: EditableAttributeCollection
): EditableAttributeCollection => {
  return {
    ...attributes,
    [category]: [...attributes[category].filter((_, idx) => idx !== index)],
  };
};

export const cleanAttributes = (
  attributes: EditableAttributeCollection
): EditableAttributeCollection => {
  const updated: EditableAttributeCollection = {};

  Object.entries(attributes).forEach(([category, attrs]) => {
    updated[category] = attrs.filter(([key, value]) => !!key || !!value);
  });

  return updated;
};
