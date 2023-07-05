import type { Property } from './properties';

enum TargetFieldType {
  Relation = 'relation',
  Custom = 'custom',
}

type TargetField = {
  type: TargetFieldType;
  value: string;
};

export type FieldMapping = {
  source: string;
  target: TargetField;
};

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
