import type { PropertyValueCollection } from "@ff-client/types/fields";
import type { Option, OptionCollection } from "@ff-client/types/properties";

export const selectableOptions = (options: OptionCollection): Option[] => {
  const values = new Map<string, Option>();
  const collect = (items: OptionCollection) => {
    for (const option of items) {
      if ("children" in option) collect(option.children);
      else if (
        !("optgroup" in option && option.optgroup) &&
        option.value !== ""
      )
        values.set(option.value, option);
    }
  };
  collect(options);
  return Array.from(values.values());
};

export const optionSampleRange = (
  properties: PropertyValueCollection,
): [number, number] => {
  switch (properties.limit) {
    case "all":
      return [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
    case "min":
      return [
        Math.max(2, properties.limitMin ?? 0),
        Math.max(3, properties.limitMin ?? 0),
      ];
    case "max":
      return [2, Math.min(3, properties.limitMax ?? 3)];
    case "range":
      return [
        Math.max(2, properties.limitRange?.[0] ?? 0),
        Math.min(
          Math.max(3, properties.limitRange?.[0] ?? 0),
          properties.limitRange?.[1] ?? 3,
        ),
      ];
    default:
      return [2, 3];
  }
};

export const selectOptionSample = (
  options: OptionCollection,
  multiple: boolean,
  range: [number, number] = [2, 3],
  random = Math.random,
): string | string[] => {
  const values = selectableOptions(options).map((option) => option.value);
  if (!values.length) return multiple ? [] : "";
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  if (!multiple) return values[0];
  const maximum = Math.min(values.length, Math.max(0, range[1]));
  const minimum = Math.min(maximum, Math.max(0, range[0]));
  const count = minimum + Math.floor(random() * (maximum - minimum + 1));
  return values.slice(0, count);
};
