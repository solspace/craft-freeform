import type { Layout, Row } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';

export const rowSelectors = {
  inLayout:
    (layout: Layout | undefined) =>
    (state: RootState): Row[] =>
      layout
        ? state.layout.rows
            .filter((row) => row.layoutUid === layout.uid)
            .sort((a, b) => a.order - b.order)
        : [],
} as const;
