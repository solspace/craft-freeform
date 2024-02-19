import { useSelector } from 'react-redux';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
import type { CalculationProperty } from '@ff-client/types/properties';

export const generateValue = (value: string): string =>
  value.replace(/field:([a-zA-Z0-9_]+)/g, (_, variable) => `[[${variable}]]`);

export const useCalculationFieldHandles = (
  property: CalculationProperty
): string[] => {
  const allFields = useSelector(fieldSelectors.all);
  const handles = allFields
    .filter((item) => property.availableFieldTypes.includes(item.typeClass))
    .map((item) => item.properties.handle);

  return handles;
};
