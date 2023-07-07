import type { Property } from './properties';

export enum TargetFieldType {
  Relation = 'relation',
  Custom = 'custom',
}

type TargetField = {
  type: TargetFieldType;
  value: string;
};

export type FieldMapping = Record<string, TargetField>;

export type Integration = {
  id: number;
  type: string;

  name: string;
  handle: string;
  description: string;

  enabled: boolean;
  icon?: string;

  properties: Property[];
};

export type IntegrationCategory = {
  label: string;
  type: string;
  children: Integration[];
};
