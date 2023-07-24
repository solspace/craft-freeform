import type { Cell, Page } from '@editor/builder/types/layout';
import type { AppDispatch, AppThunk } from '@editor/store';
import { v4 } from 'uuid';

import { contextActions } from '../slices/context';
import { cellActions } from '../slices/layout/cells';
import { layoutActions } from '../slices/layout/layouts';
import { pageActions } from '../slices/layout/pages';
import { rowActions } from '../slices/layout/rows';

import { removeEmptyRows } from './rows';

export const addNewPage = (): AppThunk => (dispatch, getState) => {
  const pageUid = v4();
  const layoutUid = v4();

  const state = getState();

  const totalPages = state.layout.pages.length;
  const nextPageNumber = totalPages + 1;

  const lastPage = state.layout.pages?.[totalPages - 1];

  dispatch(layoutActions.add({ uid: layoutUid }));
  dispatch(
    pageActions.add({
      uid: pageUid,
      label: `Page ${nextPageNumber}`,
      layoutUid,
      buttons: lastPage?.buttons ?? {
        layout: 'save back|submit',
        attributes: {
          container: {},
          column: {},
          submit: {},
          back: {},
          save: {},
        },
        submit: { label: 'Submit', enabled: true },
        back: { label: 'Back', enabled: true },
        save: { label: 'Save', enabled: false },
      },
    })
  );
  dispatch(contextActions.setPage(pageUid));
};

export const moveCellToPage =
  (cell: Cell, page: Page): AppThunk =>
  (dispatch, getState) => {
    const { layoutUid } = page;

    const rowUid = v4();

    dispatch(
      rowActions.add({
        layoutUid,
        uid: rowUid,
      })
    );
    dispatch(
      cellActions.moveTo({
        uid: cell.uid,
        rowUid,
        position: 0,
      })
    );

    removeEmptyRows(getState(), dispatch as AppDispatch);
  };

export const deletePage =
  (page: Page): AppThunk =>
  (dispatch, getState) => {
    const { uid, layoutUid } = page;

    const state = getState();
    const layout = state.layout.layouts.find(
      (layout) => layout.uid === layoutUid
    );

    if (!layout) {
      return;
    }

    const nextPage = state.layout.pages.find((page) => page.uid !== uid);

    dispatch(contextActions.unfocus());
    dispatch(contextActions.setPage(nextPage.uid));

    // remove rows
    state.layout.rows
      .filter((row) => row.layoutUid === layoutUid)
      .forEach((row) => {
        // remove cells
        state.layout.cells
          .filter((cell) => cell.rowUid === row.uid)
          .forEach((cell) => {
            dispatch(cellActions.remove(cell.uid));
          });

        dispatch(rowActions.remove(row.uid));
      });

    dispatch(layoutActions.remove(layoutUid));
    dispatch(pageActions.remove(uid));
  };
