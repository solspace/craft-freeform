import type { AppDispatch, RootState } from '..';
import { rowActions } from '../slices/layout/rows';

export const removeEmptyRows = (
  state: RootState,
  dispatch: AppDispatch
): void => {
  const removeUids: string[] = [];
  state.layout.rows.forEach((row) => {
    const fieldCount = state.layout.fields.filter(
      (field) => field.rowUid === row.uid
    ).length;

    if (fieldCount === 0) {
      removeUids.push(row.uid);
    }
  });

  removeUids.forEach((uid) => dispatch(rowActions.remove(uid)));
};
