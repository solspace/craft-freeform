import React from 'react';
import { useAppDispatch } from '@editor/store';
import { addNewPage } from '@editor/store/thunks/pages';

import { NewTabWrapper } from './tab.styles';

export const NewTab: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <NewTabWrapper
      onClick={(): void => {
        dispatch(addNewPage());
      }}
    >
      Add New Page
    </NewTabWrapper>
  );
};
