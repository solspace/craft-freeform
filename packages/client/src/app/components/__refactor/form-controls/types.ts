import type { Property } from '@ff-client/types/properties';

export type FormControlType<T, P extends Property = Property> = {
  value: T;
  property: P;
  onUpdateValue: (value: T) => void;
};
