import type { GenericValue } from '@ff-client/types/properties';

export type IntegrationState = {
  name: string;
  handle: string;
  enabled?: boolean;
  metadata: Record<string, GenericValue>;
};
