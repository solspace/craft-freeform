import type { Row } from "@editor/builder/types/layout";
import type { RootState } from "@editor/store";
import { createSelector } from "@reduxjs/toolkit";

export const fieldSelectors = {
  all: createSelector(
    (state: RootState) => state.layout.fields,
    (fields) => fields,
  ),

  count: createSelector(
    (state: RootState) => state.layout.fields,
    (fields) => fields.length,
  ),

  one: (uid: string) =>
    createSelector(
      (state: RootState) => state.layout.fields,
      (fields) => fields.find((field) => field.uid === uid),
    ),

  hasErrors: createSelector(
    (state: RootState) => state.layout.fields,
    (fields) => fields.some((field) => field.errors !== undefined),
  ),

  inRow: (row: Row) =>
    createSelector(
      (state: RootState) => state.layout.fields,
      (fields) =>
        fields
          .filter((field) => field.rowUid === row.uid)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    ),
} as const;
