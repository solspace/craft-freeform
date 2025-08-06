import { useSelector } from 'react-redux';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
import type { AiProperty } from '@ff-client/types/properties';

export const useAiFieldHandles = (property: AiProperty): string[] => {
  const allFields = useSelector(fieldSelectors.all);
  const handles = allFields
    .filter((item) => {
      // Handle wildcard case
      if (property.availableFieldTypes.includes('*')) {
        return true; // Include all fields
      }
      return property.availableFieldTypes.includes(item.typeClass);
    })
    .map((item) => item.properties.handle);

  return handles;
};
