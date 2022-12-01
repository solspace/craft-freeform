import type { AppThunk } from '@editor/store';
import { add as addLayout } from '@editor/store/slices/layouts';
import { add as addPage } from '@editor/store/slices/pages';
import { v4 } from 'uuid';

export const addNewPage = (): AppThunk => (dispatch, getState) => {
  const pageUid = v4();
  const layoutUid = v4();

  const state = getState();

  const totalPages = state.pages.length;
  const nextPageNumber = totalPages + 1;

  dispatch(addLayout({ uid: layoutUid }));
  dispatch(
    addPage({
      uid: pageUid,
      label: `Page ${nextPageNumber}`,
      layoutUid,
      order: nextPageNumber,
    })
  );
};
