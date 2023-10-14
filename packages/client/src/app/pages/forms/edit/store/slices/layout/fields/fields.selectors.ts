import type { Row } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import { createSelector } from '@reduxjs/toolkit';

import type { Field } from '.';

export const fieldSelectors = {
  all: (state: RootState): Field[] => state.layout.fields,
  count: (state: RootState): number => state.layout.fields.length,

  one:
    (uid: string) =>
    (state: RootState): Field =>
      state.layout.fields.find((field) => field.uid === uid),

  hasErrors: (state: RootState): boolean =>
    Boolean(state.layout.fields.find((field) => field.errors !== undefined)),

  inRow: (row: Row) =>
    createSelector(
      (state: RootState): Field[] => state.layout.fields,
      (fields) =>
        fields
          .filter((field) => field.rowUid === row.uid)
          .sort((a, b) => a.order - b.order)
    ),
} as const;
