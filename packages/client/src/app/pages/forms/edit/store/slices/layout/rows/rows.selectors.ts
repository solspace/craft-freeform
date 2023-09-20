import type { Row } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import { createSelector } from '@reduxjs/toolkit';

export const rowSelectors = {
  inLayout: createSelector(
    (state: RootState): Row[] => state.layout.rows,
    (_: RootState, layoutUid?: string) => layoutUid,
    (rows, layoutUid) =>
      [...rows]
        .filter((row) => row.layoutUid === layoutUid)
        .sort((a, b) => a.order - b.order)
  ),
} as const;
