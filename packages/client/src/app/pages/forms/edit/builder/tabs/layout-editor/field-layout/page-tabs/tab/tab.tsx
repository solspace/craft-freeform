import { unfocus } from '@ff-client/app/pages/forms/edit/store/slices/context';
import { useAppDispatch } from '@ff-client/app/pages/forms/edit/store/store';
import React from 'react';

import { Page } from '../../../../../types/layout';
import { TabWrapper } from './tab.styles';

export const Tab: React.FC<Page> = (page) => {
  const dispatch = useAppDispatch();

  return (
    <TabWrapper
      onClick={(): void => {
        dispatch(unfocus());
      }}
    >
      {page.label}
    </TabWrapper>
  );
};
