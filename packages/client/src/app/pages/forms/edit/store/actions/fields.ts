import { FieldType } from '@ff-client/types/fields';
import { v4 } from 'uuid';

import { CellType } from '../../builder/types/layout';
import { add as addCell } from '../slices/cells';
import { selectCurrentPage } from '../slices/context';
import { add as addField } from '../slices/fields';
import { add as addRow } from '../slices/rows';
import { AppThunk } from '../store';

export const addNewField =
  (fieldType: FieldType): AppThunk =>
  (dispatch, getState) => {
    const fieldUid = v4();
    const cellUid = v4();
    const rowUid = v4();

    const state = getState();

    const currentPage = selectCurrentPage(state);
    if (!currentPage) {
      throw new Error('No pages present');
    }

    dispatch(addField({ fieldType, uid: fieldUid }));
    dispatch(addRow({ layoutUid: currentPage.layoutUid, uid: rowUid }));
    dispatch(
      addCell({
        type: CellType.Field,
        rowUid,
        targetUid: fieldUid,
        uid: cellUid,
      })
    );
  };
