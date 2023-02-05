import type { Field } from '@editor/store/slices/fields';
import type { Property } from '@ff-client/types/properties';

export type ControlType<T> = {
  field: Field;
  property: Property;
  updateValue: (value: T) => void;
};
