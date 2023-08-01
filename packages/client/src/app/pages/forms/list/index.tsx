import React from 'react';
import { Provider } from 'react-redux';
import { ModalProvider } from '@components/modals/modal.context';

import { List } from './list';
import { store } from './store';

export const ListProvider: React.FC = () => {
  return (
    <Provider store={store}>
      <ModalProvider>
        <List />
      </ModalProvider>
    </Provider>
  );
};
