import type { GenericValue } from '@ff-client/types/properties';

export type FormProperties = {
  name: string;
  handle: string;
  [key: string]: GenericValue;
};

export type FormType = {
  id?: number;
  uid: string;
  type: string;
  properties: FormProperties;
};
