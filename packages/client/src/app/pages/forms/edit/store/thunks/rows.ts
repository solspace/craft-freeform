import type { AppDispatch, RootState } from '..';
import { rwoActions } from '../slices/layout/rows';

export const removeEmptyRows = (
  state: RootState,
  dispatch: AppDispatch
): void => {
  const removeUids: string[] = [];
  state.layout.rows.forEach((row) => {
    const cellCount = state.layout.cells.filter(
      (cell) => cell.rowUid === row.uid
    ).length;

    if (cellCount === 0) {
      removeUids.push(row.uid);
    }
  });

  removeUids.forEach((uid) => dispatch(rwoActions.remove(uid)));
};
