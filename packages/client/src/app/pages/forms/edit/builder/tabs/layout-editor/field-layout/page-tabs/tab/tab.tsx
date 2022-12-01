import React from 'react';
import { useSelector } from 'react-redux';
import type { Page } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { selectCurrentPage, setPage } from '@editor/store/slices/context';

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
