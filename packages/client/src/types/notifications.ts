import type { GenericValue, Property } from './properties';

export type Notification = {
  id: number;
  uid: string;
  type: string;
  class: string;

  name: string;
  enabled: boolean;

  [key: string]: GenericValue;
};

export type NotificationType = {
  name: string;
  icon: string;
  type: string;
  class: string;
  properties: Property[];
};
