import type { AppDispatch } from '@editor/store';
import type { Field } from '@editor/store/slices/fields';
import type { FieldProperty } from '@ff-client/types/fields';

export type ControlType = {
  field: Field;
  property: FieldProperty;
  dispatch: AppDispatch;
};
