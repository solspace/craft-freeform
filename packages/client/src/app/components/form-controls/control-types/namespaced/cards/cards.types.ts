import type { GenericValue } from "@ff-client/types/properties";

export type Card = {
  id: string;
  label: string;
  value?: string;
  assetId?: number;
  description?: string;
  metadata?: Record<string, GenericValue>;
};
