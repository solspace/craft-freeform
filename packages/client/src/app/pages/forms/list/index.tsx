import React from 'react';
import { Provider } from 'react-redux';
import { ModalProvider } from '@components/modals/modal.context';
import {
  fetchFieldPropertySections,
  fetchFieldTypes,
  QKFieldTypes,
} from '@ff-client/queries/field-types';
import { useQueryClient } from '@tanstack/react-query';

import { List } from './list';
import { store } from './store';

export const ListProvider: React.FC = () => {
  const queryClient = useQueryClient();

  queryClient.prefetchQuery(QKFieldTypes.all, fetchFieldTypes);
  queryClient.prefetchQuery(
    QKFieldTypes.propertySections(),
    fetchFieldPropertySections
  );

  return (
    <Provider store={store}>
      <ModalProvider>
        <List />
      </ModalProvider>
    </Provider>
  );
};
