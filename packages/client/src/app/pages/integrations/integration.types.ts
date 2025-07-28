import type { IntegrationType } from '@ff-client/types/integrations';
import type { Property } from '@ff-client/types/properties';

export type TypeDefinition = {
  editions: string[];
  class: string;
  shortName: string;
  name: string;
  type: IntegrationType;
  version?: string;
  nameWithVersion: string;
  readmeContent?: string;
  iconSvg?: string;
};

export type Integration = {
  id?: number;
  name: string;
  handle: string;
  enabled: boolean;
  type: TypeDefinition;
  implements: string[];
  properties: Property[];
  errors?: Record<string, string[]>;
};

export type AuthState = 'authorized' | 'unauthorized' | 'pending' | 'error';
