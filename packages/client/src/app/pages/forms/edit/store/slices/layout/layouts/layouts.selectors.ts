import type { Layout, Page } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';

export const layoutSelectors = {
  one:
    (uid: string) =>
    (state: RootState): Layout | undefined =>
      state.layout.layouts.find((layout) => layout.uid === uid),
  pageLayout:
    (page: Page) =>
    (state: RootState): Layout | undefined =>
      state.layout.layouts.find((layout) => layout.uid === page?.layoutUid),
} as const;
