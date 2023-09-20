import type { Layout } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import { createSelector } from '@reduxjs/toolkit';

import type { Field } from '../fields';
import { pageSelecors } from '../pages/pages.selectors';
import { rowSelectors } from '../rows/rows.selectors';

export const layoutSelectors = {
  one: createSelector(
    (state: RootState) => state.layout.layouts,
    (_, uid?: string) => uid,
    (layouts: Layout[], uid) => layouts.find((layout) => layout.uid === uid)
  ),
  currentPageLayout: createSelector(
    (state: RootState) => pageSelecors.current(state),
    (state: RootState) => state.layout.layouts,
    (currentPage, layouts) =>
      layouts.find((layout) => layout.uid === currentPage?.layoutUid)
  ),
  pageLayout: createSelector(
    (state: RootState) => state.layout.layouts,
    (_, pageLayoutUid: string) => pageLayoutUid,
    (layouts: Layout[], pageLayoutUid: string) =>
      layouts.find((layout) => layout.uid === pageLayoutUid)
  ),
  cartographed: {
    layoutFieldList: createSelector(
      (state: RootState) => state.layout.fields,
      (state: RootState, layoutUid: string) =>
        state.layout.layouts.find((layout) => layout.uid === layoutUid),
      (state: RootState) => state,
      (fields, layout, state) => {
        const rows = rowSelectors.inLayout(state, layout?.uid);

        const layoutFields: Field[] = [];
        rows.forEach((row) => {
          layoutFields.push(
            ...fields.filter((field) => field.rowUid === row.uid)
          );
        });

        return layoutFields;
      }
    ),
    pageFieldList: createSelector(
      (state: RootState) => state.layout.pages,
      (state: RootState) => state.layout.layouts,
      (state: RootState) => state.layout.rows,
      (state: RootState) => state.layout.fields,
      (pages, layouts, rows, fields) => {
        const cartograph: Array<{ page: string; fields: Field[] }> = [];

        pages.forEach((page) => {
          const layout = layouts.find(
            (layout) => layout.uid === page.layoutUid
          );

          const layoutRows = rows
            .filter((row) => row.layoutUid === layout?.uid)
            .sort((a, b) => a.order - b.order);

          const layoutFields: Field[] = [];
          layoutRows.forEach((row) => {
            layoutFields.push(
              ...fields.filter((field) => field.rowUid === row.uid)
            );
          });

          cartograph.push({ page: page.uid, fields });
        });

        return cartograph;
      }
    ),

    fullLayoutList: createSelector(
      (state: RootState) => state.layout.pages,
      (state: RootState) => state.layout.layouts,
      (state: RootState) => state.layout.rows,
      (state: RootState) => state.layout.fields,
      (pages, layouts, rows, fields) => {
        const cartograph: Array<Array<Field[]>> = [];

        pages.forEach((page) => {
          const layout = layouts.find(
            (layout) => layout.uid === page.layoutUid
          );

          const layoutRows = rows
            .filter((row) => row.layoutUid === layout?.uid)
            .sort((a, b) => a.order - b.order);

          const rowList: Array<Array<Field>> = [];
          layoutRows.forEach((row) => {
            const layoutFields: Field[] = [];
            layoutFields.push(
              ...fields.filter((field) => field.rowUid === row.uid)
            );
            rowList.push(layoutFields);
          });

          cartograph.push(rowList);
        });

        return cartograph;
      }
    ),

    fullLayoutList_: (state: RootState) => {
      const pages = pageSelecors.all(state);

      const cartograph: Array<Array<Field[]>> = [];

      pages.forEach((page) => {
        const layout = state.layout.layouts.find(
          (layout) => layout.uid === page.layoutUid
        );
        const rows = rowSelectors.inLayout(state, layout?.uid);

        const rowList: Array<Field[]> = [];
        rows.forEach((row) => {
          const fields: Field[] = [];
          state.layout.fields
            .filter((field) => field.rowUid === row.uid)
            .forEach((field) => {
              fields.push(field);
            });

          rowList.push(fields);
        });

        cartograph.push(rowList);
      });

      return cartograph;
    },
  },
} as const;
