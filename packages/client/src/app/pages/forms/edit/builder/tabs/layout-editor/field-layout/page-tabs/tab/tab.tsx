import React from 'react';
import { useSelector } from 'react-redux';
import type { Page } from '@editor/builder/types/layout';
import { useAppDispatch } from '@ff-client/app/pages/forms/edit/store';
import {
  selectCurrentPage,
  setPage,
} from '@ff-client/app/pages/forms/edit/store/slices/context';

import { TabWrapper } from './tab.styles';

export const Tab: React.FC<Page> = (page) => {
  const { uid } = useSelector(selectCurrentPage);
  const dispatch = useAppDispatch();

  return (
    <TabWrapper
      active={uid === page.uid}
      onClick={(): void => {
        dispatch(setPage(page.uid));
      }}
    >
      {page.label}
    </TabWrapper>
  );
};
