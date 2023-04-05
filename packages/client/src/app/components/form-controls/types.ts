import type { Property } from '@ff-client/types/properties';

export type ControlType<T, P extends Property = Property, C = unknown> = {
  property: P;
  value: T;
  updateValue: (value: T) => void;
  errors?: string[];
  context?: C;
};
