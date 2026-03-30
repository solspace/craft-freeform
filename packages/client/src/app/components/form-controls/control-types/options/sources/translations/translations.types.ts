import type { GenericValue } from "@ff-client/types/properties";

import type { Option } from "../../options.types";

export type OptionTranslations = {
  emptyOption?: string;
  options?: Option[];
  defaultValue?: string | string[];
};

export type ElementTranslations = {
  emptyOption?: string;
  defaultValue?: string | string[];
  properties: Record<string, GenericValue>;
};
