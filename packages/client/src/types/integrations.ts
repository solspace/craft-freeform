export enum SettingType {
  Text = 'text',
  Boolean = 'bool',
  Password = 'password',
  Auto = 'auto',
  Internal = 'internal',
  Config = 'config',
}

export type IntegrationSetting = {
  type: SettingType;
  name: string;
  handle: string;
  instructions?: string;
  required: boolean;
  value: boolean | string | number | null;
};

export type Integration = {
  id: number;
  type: string;

  name: string;
  handle: string;
  description: string;

  enabled: boolean;
  icon?: string;

  settings: IntegrationSetting[];
  mapping: [];
};

export type IntegrationCategory = {
  label: string;
  type: string;
  children: Integration[];
};
