import { fieldSelectors } from "@editor/store/slices/layout/fields/fields.selectors";
import type { FieldSelectionProperty } from "@ff-client/types/properties";
import { useSelector } from "react-redux";

export const generateValue = (value: string, format?: string): string => {
  // Mirror calculation-box: replace each field:handle in place.
  // Do not join with commas — Tagify MixedTags expects `[[a]] [[b]]`.
  return value.replace(/field:([a-zA-Z0-9_]+)/g, (_, variable: string) => {
    if (format === "<mark>...</mark>") {
      return `<mark>${variable}</mark>`;
    }

    return `[[${variable}]]`;
  });
};

export const useFieldSelectionHandles = (
  property: FieldSelectionProperty,
): string[] => {
  const allFields = useSelector(fieldSelectors.all);
  const handles = allFields
    .filter((item) => {
      // Handle wildcard case
      if (property.availableFieldTypes.includes("*")) {
        return true; // Include all fields
      }
      return property.availableFieldTypes.includes(item.typeClass);
    })
    .map((item) => item.properties.handle);

  return handles;
};
