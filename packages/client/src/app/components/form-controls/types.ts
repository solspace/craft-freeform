import type { Property } from '@ff-client/types/properties';

export type ControlType<P extends Property, C = unknown> = {
  property: P;
  value: P['value'];
  updateValue: (value: P['value']) => void;
  errors?: string[];
  context?: C;
  autoFocus?: boolean;
};
