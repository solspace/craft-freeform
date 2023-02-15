import type { FieldFavorite } from '@ff-client/types/fields';
import type { FieldType } from '@ff-client/types/properties';

export const cloneFieldTypeFromFavorite = (
  favorite: FieldFavorite,
  fieldType: FieldType
): FieldType => {
  const clone = { ...fieldType };

  Object.entries(favorite.properties).map(([name, value]) => {
    clone.properties.find((property) => property.handle === name).value = value;
  });

  return clone;
};
