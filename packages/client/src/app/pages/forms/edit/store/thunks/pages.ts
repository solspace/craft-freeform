import type { Cell, Page } from '@editor/builder/types/layout';
import type { AppDispatch, AppThunk } from '@editor/store';
import { v4 } from 'uuid';

import { cellActions } from '../slices/layout/cells';
import { layoutActions } from '../slices/layout/layouts';
import { pageActions } from '../slices/layout/pages';
import { rwoActions } from '../slices/layout/rows';

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
};

export const moveCellToPage =
  (cell: Cell, page: Page): AppThunk =>
  (dispatch, getState) => {
    const { layoutUid } = page;

    const rowUid = v4();

    dispatch(
      rwoActions.add({
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
