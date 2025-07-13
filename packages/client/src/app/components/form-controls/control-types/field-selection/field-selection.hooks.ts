import { useSelector } from 'react-redux';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
import type { FieldSelectionProperty } from '@ff-client/types/properties';

export const generateValue = (value: string, format?: string): string => {
  // Extract all field handles from the value
  const fieldMatches = value.match(/field:([a-zA-Z0-9_]+)/g);

  if (!fieldMatches || fieldMatches.length === 0) {
    return value;
  }

  // Extract just the handle names (remove 'field:' prefix)
  const fieldHandles = fieldMatches.map((match) => match.replace('field:', ''));

  if (format === '<mark>...</mark>') {
    // Join with commas and wrap each in mark tags
    return fieldHandles.map((handle) => `<mark>${handle}</mark>`).join(', ');
  }

  // For other formats, join with commas and wrap in brackets
  return fieldHandles.map((handle) => `[[${handle}]]`).join(', ');
};

export const useFieldSelectionHandles = (
  property: FieldSelectionProperty
): string[] => {
  const allFields = useSelector(fieldSelectors.all);
  const handles = allFields
    .filter((item) => property.availableFieldTypes.includes(item.typeClass))
    .map((item) => item.properties.handle);

  return handles;
};
