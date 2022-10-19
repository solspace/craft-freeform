import { Field } from '@ff-client/app/pages/forms/edit/store/slices/fields';
import { AppDispatch } from '@ff-client/app/pages/forms/edit/store/store';
import { FieldProperty } from '@ff-client/types/fields';

export type ControlType = {
  field: Field;
  property: FieldProperty;
  dispatch: AppDispatch;
};
