import { type Page } from '@editor/builder/types/layout';
import type { AppDispatch, AppThunk } from '@editor/store';
import { v4 } from 'uuid';

import { contextActions } from '../slices/context';
import type { Field } from '../slices/layout/fields';
import { fieldActions } from '../slices/layout/fields';
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
        submitLabel: 'Submit',
        back: true,
        backLabel: 'Back',
        save: false,
        saveLabel: 'Save',
      },
    })
  );
  dispatch(contextActions.setPage(pageUid));
};

export const moveFieldToPage =
  (field: Field, page: Page): AppThunk =>
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
      fieldActions.moveTo({
        uid: field.uid,
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
        // remove fields
        const fieldUids: string[] = [];

        state.layout.fields
          .filter((field) => field.rowUid === row.uid)
          .forEach((field) => {
            fieldUids.push(field.uid);
          });

        dispatch(fieldActions.removeBatch(fieldUids));
        dispatch(rowActions.remove(row.uid));
      });

    dispatch(layoutActions.remove(layoutUid));
    dispatch(pageActions.remove(uid));
  };
