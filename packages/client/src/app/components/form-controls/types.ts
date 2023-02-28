import type { Property } from '@ff-client/types/properties';

export type ControlType<T, C = unknown> = {
  property: Property;
  value: T;
  updateValue: (value: T) => void;
  context?: C;
};
