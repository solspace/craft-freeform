import type { Row } from '@editor/builder/types/layout';
import { CellType } from '@editor/builder/types/layout';
import type { AppThunk } from '@editor/store';
import { add as addCell } from '@editor/store/slices/cells';
import { selectCurrentPage } from '@editor/store/slices/context';
import { add as addField } from '@editor/store/slices/fields';
import { add as addRow } from '@editor/store/slices/rows';
import type { FieldType } from '@ff-client/types/fields';
import { v4 } from 'uuid';

export const addNewField =
  (fieldType: FieldType, row?: Row): AppThunk =>
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
    dispatch(
      addRow({
        layoutUid: currentPage.layoutUid,
        uid: rowUid,
        order: row?.order,
      })
    );
    dispatch(
      addCell({
        type: CellType.Field,
        rowUid,
        targetUid: fieldUid,
        uid: cellUid,
      })
    );
  };
