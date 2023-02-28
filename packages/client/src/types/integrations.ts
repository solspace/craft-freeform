import type { Property } from './properties';

export type Integration = {
  id: number;
  type: string;

  name: string;
  handle: string;
  description: string;

  enabled: boolean;
  icon?: string;

  properties: Property[];
  mapping: [];
};

export type IntegrationCategory = {
  label: string;
  type: string;
  children: Integration[];
};
