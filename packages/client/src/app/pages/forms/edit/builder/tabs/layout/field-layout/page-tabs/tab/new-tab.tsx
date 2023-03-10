import React from 'react';
import { useAppDispatch } from '@editor/store';
import { addNewPage } from '@editor/store/thunks/pages';

import { NewTabWrapper, PageTab } from './tab.styles';

export const NewTab: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <NewTabWrapper
      onClick={(): void => {
        dispatch(addNewPage());
      }}
    >
      <PageTab>Add New Page</PageTab>
    </NewTabWrapper>
  );
};
