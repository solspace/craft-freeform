import React from 'react';
import { useAppDispatch } from '@editor/store';
import { addNewPage } from '@editor/store/thunks/pages';

import AddIcon from './add-icon.svg';
import { NewTabWrapper } from './new-tab.styles';

export const NewTab: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <NewTabWrapper
      onClick={(): void => {
        dispatch(addNewPage());
      }}
    >
      <AddIcon />
    </NewTabWrapper>
  );
};
