import type { Property } from './properties';

export type Notification = {
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

export type NotificationCategory = {
  label: string;
  type: string;
  children: Notification[];
};
