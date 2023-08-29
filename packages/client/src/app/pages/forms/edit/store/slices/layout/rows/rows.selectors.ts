import type { Layout, Row } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import { createSelector } from '@reduxjs/toolkit';

export const rowSelectors = {
  inLayout: (layout: Layout | undefined) =>
    createSelector(
      (state: RootState): Row[] => state.layout.rows,
      (rows) =>
        [...rows]
          .filter((row) => row.layoutUid === layout?.uid)
          .sort((a, b) => a.order - b.order)
    ),
} as const;
