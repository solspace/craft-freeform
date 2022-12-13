import type { AppDispatch } from '@editor/store';
import type { Field } from '@editor/store/slices/fields';
import type { Property } from '@ff-client/types/properties';

export type ControlType = {
  field: Field;
  property: Property;
  dispatch: AppDispatch;
};
