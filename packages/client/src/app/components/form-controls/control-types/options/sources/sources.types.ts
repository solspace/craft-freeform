import type { Property } from "@ff-client/types/properties";

export type OptionTypeProvider = {
  name: string;
  typeClass: string;
  icon?: string | null;
  properties: Property[];
};
