import type { FieldFavorite, FieldType } from "@ff-client/types/fields";
import cloneDeep from "lodash/cloneDeep";

export const cloneFieldTypeFromFavorite = (
  favorite: FieldFavorite,
  fieldType: FieldType,
): FieldType => {
  const clone = cloneDeep(fieldType);

  Object.entries(favorite.properties).forEach(([name, value]) => {
    const property = clone?.properties?.find(
      (property) => property.handle === name,
    );

    if (property) {
      property.value = value;
    }
  });

  return clone;
};
