import type { GenericValue } from './properties';

export type Form = {
  id?: number;
  uid: string;
  type: string;
  properties: {
    name: string;
    handle: string;
    [key: string]: GenericValue;
  };
};
