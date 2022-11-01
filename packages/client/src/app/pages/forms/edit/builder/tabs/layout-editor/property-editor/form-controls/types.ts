import type { Field } from '@ff-client/app/pages/forms/edit/store/slices/fields';
import type { AppDispatch } from '@ff-client/app/pages/forms/edit/store/store';
import type { FieldProperty } from '@ff-client/types/fields';

export type ControlType = {
  field: Field;
  property: FieldProperty;
  dispatch: AppDispatch;
};
