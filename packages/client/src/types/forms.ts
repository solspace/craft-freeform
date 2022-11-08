import type { PropertiesProps } from '@ff-client/types/properties';

export type FormProps = {
  id?: number;
  uid: string;
  type: string;
  properties: PropertiesProps;
};
