import React from 'react';
import { CellType } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { contextSelectors } from '@editor/store/slices/context/context.selectors';
import { cellActions } from '@editor/store/slices/layout/cells';
import { layoutActions } from '@editor/store/slices/layout/layouts';
import { rowActions } from '@editor/store/slices/layout/rows';
import { useFetchFieldPropertySections } from '@ff-client/queries/field-types';
import { v4 } from 'uuid';

import { BaseFields } from './implementations/base-fields/base-fields';
import { FavoriteFields } from './implementations/favorite-fields/favorite-fields';
import { FormsFields } from './implementations/forms-fields/forms-fields';
import { Search } from './search/search';
import { FieldListWrapper } from './field-list.styles';

export const FieldList: React.FC = () => {
  useFetchFieldPropertySections();

  const dispatch = useAppDispatch();
  const onClick = (): void => {
    dispatch((dispatch, getState) => {
      const layoutUid = v4();
      const cellUid = v4();
      const rowUid = v4();

      const state = getState();

      const currentPage = contextSelectors.currentPage(state);
      if (!currentPage) {
        throw new Error('No pages present');
      }

      dispatch(
        layoutActions.add({
          uid: layoutUid,
        })
      );
      dispatch(
        rowActions.add({
          layoutUid: currentPage.layoutUid,
          uid: rowUid,
        })
      );
      dispatch(
        cellActions.add({
          type: CellType.Layout,
          rowUid,
          targetUid: layoutUid,
          uid: cellUid,
        })
      );
    });
  };

  return (
    <FieldListWrapper>
      <Search />
      <button onClick={onClick}>Add group field</button>
      <FavoriteFields />
      <BaseFields />
      <FormsFields />
    </FieldListWrapper>
  );
};
