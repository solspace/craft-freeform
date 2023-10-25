import React from 'react';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { ModalProvider } from '@components/modals/modal.context';
import {
  fetchFieldPropertySections,
  fetchFieldTypes,
  QKFieldTypes,
} from '@ff-client/queries/field-types';
import { useQueryClient } from '@tanstack/react-query';

import { List } from './list';

export const ListProvider: React.FC = () => {
  const queryClient = useQueryClient();

  queryClient.prefetchQuery(QKFieldTypes.all, fetchFieldTypes);
  queryClient.prefetchQuery(
    QKFieldTypes.propertySections(),
    fetchFieldPropertySections
  );

  return (
    <ModalProvider>
      <Breadcrumb label="Forms" url="/forms" />
      <List />
    </ModalProvider>
  );
};
