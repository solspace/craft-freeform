import type { GenericValue } from './properties';

export type Form = {
  id?: number;
  uid: string;
  type: string;
  // TODO: remove these two, when the form payload is refactored.
  name: string;
  handle: string;
  // ------------------------------------------------------------
  properties: {
    name: string;
    handle: string;
    [key: string]: GenericValue;
  };
};
