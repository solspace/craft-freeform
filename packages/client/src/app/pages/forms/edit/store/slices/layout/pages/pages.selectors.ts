import type { Page } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import { createSelector } from '@reduxjs/toolkit';

const sortByOrder = (a: Page, b: Page): number => a.order - b.order;

export const pageSelecors = {
  current: (state: RootState): Page =>
    state.layout.pages.find((page) => page.uid === state.context.page),
  count: (state: RootState): number => state.layout.pages.length,
  all: createSelector(
    (state: RootState) => state.layout.pages,
    (pages) => [...pages].sort(sortByOrder)
  ),
  one:
    (uid: string) =>
    (state: RootState): Page | undefined =>
      state.layout.pages.find((page) => page.uid === uid),
  pageIndex:
    (uid: string) =>
    (state: RootState): number =>
      state.layout.pages.findIndex((page) => page.uid === uid),
} as const;
