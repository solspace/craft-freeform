import type { Notification } from '@ff-client/types/notifications';
import type { GenericValue } from '@ff-client/types/properties';

export type NotificationModificationPayload = {
  uid: string;
  key: string;
  value: GenericValue;
};

export type NotificationErrors = {
  [key: string]: string[];
};

export type ErrorPayload = {
  [key: string]: NotificationErrors;
};

export type NotificationInstance = Notification & {
  errors?: NotificationErrors;
};
