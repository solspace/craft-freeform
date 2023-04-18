import type { Page } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';

const sortByOrder = (a: Page, b: Page): number => a.order - b.order;

export const pageSelecors = {
  all: (state: RootState): Page[] => [...state.layout.pages].sort(sortByOrder),
  one:
    (uid: string) =>
    (state: RootState): Page | undefined =>
      state.layout.pages.find((page) => page.uid === uid),
} as const;
