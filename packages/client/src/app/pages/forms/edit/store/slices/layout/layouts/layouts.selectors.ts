import type { Layout, Page } from '@editor/builder/types/layout';
import { CellType } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';

import { pageSelecors } from '../pages/pages.selectors';
import { rowSelectors } from '../rows/rows.selectors';

export const layoutSelectors = {
  one:
    (uid: string) =>
    (state: RootState): Layout | undefined =>
      state.layout.layouts.find((layout) => layout.uid === uid),
  currentPageLayout: (state: RootState): Layout =>
    layoutSelectors.pageLayout(pageSelecors.current(state))(state),
  pageLayout:
    (page: Page) =>
    (state: RootState): Layout | undefined =>
      state.layout.layouts.find((layout) => layout.uid === page?.layoutUid),
  cartographed: {
    pageFieldList: (state: RootState) => {
      const pages = pageSelecors.all(state);

      const cartograph: Array<{ page: string; fields: string[] }> = [];

      pages.forEach((page) => {
        const layout = layoutSelectors.pageLayout(page)(state);
        const rows = rowSelectors.inLayout(layout)(state);

        const fields: string[] = [];
        rows.forEach((row) => {
          state.layout.cells
            .filter(
              (cell) => cell.rowUid === row.uid && cell.type === CellType.Field
            )
            .forEach((cell) => {
              fields.push(cell.targetUid);
            });
        });

        cartograph.push({ page: page.uid, fields });
      });

      return cartograph;
    },
    fullLayoutList: (state: RootState) => {
      const pages = pageSelecors.all(state);

      const cartograph: Array<Array<string[]>> = [];

      pages.forEach((page) => {
        const layout = layoutSelectors.pageLayout(page)(state);
        const rows = rowSelectors.inLayout(layout)(state);

        const rowList: Array<string[]> = [];
        rows.forEach((row) => {
          const fields: string[] = [];
          state.layout.cells
            .filter(
              (cell) => cell.rowUid === row.uid && cell.type === CellType.Field
            )
            .forEach((cell) => {
              fields.push(cell.targetUid);
            });

          rowList.push(fields);
        });

        cartograph.push(rowList);
      });

      return cartograph;
    },
  },
} as const;
