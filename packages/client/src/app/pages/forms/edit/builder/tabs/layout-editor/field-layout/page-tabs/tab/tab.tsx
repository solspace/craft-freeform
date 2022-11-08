import React from 'react';
import type { Page } from '@editor/builder/types/layout';
import { useAppDispatch } from '@ff-client/app/pages/forms/edit/store';
import { unfocus } from '@ff-client/app/pages/forms/edit/store/slices/context';

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
