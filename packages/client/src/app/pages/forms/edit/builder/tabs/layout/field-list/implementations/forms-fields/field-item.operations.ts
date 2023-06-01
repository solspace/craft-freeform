import type { FieldBase } from '@ff-client/types/fields';
import type { FieldType } from '@ff-client/types/properties';

export const cloneFieldTypeFromForm = (
  field: FieldBase,
  fieldType: FieldType
): FieldType => {
  const clone = { ...fieldType };

  Object.entries(field.properties).map(([name, value]) => {
    const property = clone?.properties?.find(
      (property) => property.handle === name
    );

    if (property) {
      property.value = value;
    }
  });

  return clone;
};
