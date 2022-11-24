import type { GenericValue } from '@ff-client/types/properties';

export type Properties = {
  name: string;
  handle: string;
  [key: string]: GenericValue;
};

export type Form = {
  id?: number;
  uid: string;
  type: string;
  properties: Properties;
};

export type Attribute = {
  index?: number;
  key: string;
  value?: string;
};
