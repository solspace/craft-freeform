import type { Cell, Row } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';

export const cellSelectors = {
  inRow:
    (row: Row) =>
    (state: RootState): Cell[] =>
      state.layout.cells
        .filter((cell) => cell.rowUid === row.uid)
        .sort((a, b) => a.order - b.order),
} as const;
