import type { GenericValue, Property } from './properties';

export type Notification = {
  id?: number;
  uid: string;
  class: string;

  name: string;
  enabled: boolean;

  [key: string]: GenericValue;
};

export type NotificationType = {
  name: string;
  newInstanceName: string;
  icon: string;
  class: string;
  properties: Property[];
};

export type Recipient = {
  email: string;
  name?: string;
};

export enum TemplateType {
  Database = 'database',
  File = 'file',
}

export type NotificationTemplate = {
  id: string | number;
  name: string;
  handle: string;
  description: string;

  fromEmail: string;
  fromName: string;
  replyToName: string;
  replyToEmail: string;
  cc: string;
  bcc: string;

  subject: string;
  body: string;
  textBody: string;
  autoText: boolean;

  includeAttachments: boolean;
  presetAssets: string[];
};
