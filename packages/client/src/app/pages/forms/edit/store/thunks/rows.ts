import type { AppDispatch, RootState } from '..';
import { remove } from '../slices/rows';

export const removeEmptyRows = (
  state: RootState,
  dispatch: AppDispatch
): void => {
  const removeUids: string[] = [];
  state.rows.forEach((row) => {
    const cellCount = state.cells.filter(
      (cell) => cell.rowUid === row.uid
    ).length;

    if (cellCount === 0) {
      removeUids.push(row.uid);
    }
  });

  removeUids.forEach((uid) => dispatch(remove(uid)));
};
