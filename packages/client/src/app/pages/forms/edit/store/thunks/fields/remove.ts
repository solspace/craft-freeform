import type { AppDispatch, AppThunk } from '@editor/store';
import type { Field } from '@editor/store/slices/layout/fields';
import { fieldActions } from '@editor/store/slices/layout/fields';

import { removeEmptyRows } from '../rows';

export default (field: Field): AppThunk =>
  (dispatch, getState) => {
    dispatch(fieldActions.remove(field.uid));
    removeEmptyRows(getState(), dispatch as AppDispatch);
  };
