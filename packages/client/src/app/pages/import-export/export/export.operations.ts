import type { FormImportData } from "../import/import.types";

import type { ExportOptions } from "./export.types";

export const isAllOptionsEmpty = (options: ExportOptions): boolean => {
  let isEmpty = true;
  Object.keys(options).forEach((keyname: keyof ExportOptions) => {
    const value = options[keyname];

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.keys(value).forEach((subKey) => {
        const subValue = (value as Record<string, unknown>)[subKey];
        if (Array.isArray(subValue)) {
          if (subValue.length > 0) {
            isEmpty = false;
          }
        }
      });
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        isEmpty = false;
      }
    } else if (typeof value === "boolean") {
      if (value) {
        isEmpty = false;
      }
    }
  });

  return isEmpty;
};

export const isAllOptionsSelected = (
  options: ExportOptions,
  data: FormImportData,
): boolean => {
  let isSelected = true;

  Object.keys(options).forEach((keyname: keyof ExportOptions) => {
    const value = options[keyname];

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.keys(value).forEach((subKey) => {
        const subValue = (value as Record<string, unknown>)[subKey];
        if (Array.isArray(subValue)) {
          // @ts-expect-error "subValue" is an array
          if (subValue.length !== data[keyname][subKey]?.length) {
            isSelected = false;
          }
        }
      });
    } else if (Array.isArray(value)) {
      // @ts-expect-error "value" is an array
      if (value.length !== data[keyname]?.length) {
        isSelected = false;
      }
    } else if (typeof value === "boolean") {
      if (!value) {
        isSelected = false;
      }
    }
  });

  return isSelected;
};
