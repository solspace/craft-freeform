import type { Property } from './properties';

export enum IntegrationType {
  EmailMarketing = 'email-marketing',
  Crm = 'crm',
  Elements = 'elements',
  Captchas = 'captchas',
  PaymentGateways = 'payment-gateways',
  Webhooks = 'webhooks',
  Singles = 'single',
  Other = 'other',
}

export enum TargetFieldType {
  Relation = 'relation',
  Custom = 'custom',
  Preset = 'preset',
}

type TargetField = {
  type: TargetFieldType;
  value: string;
};

export type FieldMapping = Record<string, TargetField>;

export type Integration = {
  id: number;
  uid: string;
  instanceUid: string;
  type: string;
  shortName: string;

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
