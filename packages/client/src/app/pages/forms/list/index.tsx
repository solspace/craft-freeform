import React from 'react';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { ModalProvider } from '@components/modals/modal.context';
import { useLocalStorage } from '@ff-client/hooks/ts-hooks/use-local-storage';
import {
  fetchFieldPropertySections,
  fetchFieldTypes,
  QKFieldTypes,
} from '@ff-client/queries/field-types';
import { useFetchFormGroups } from '@ff-client/queries/form-groups';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { useQueryClient } from '@tanstack/react-query';

import { useCreateFormModal } from './modals/hooks/use-create-form-modal';
import { FormGrid } from './views/grid/grid';
import { GridSites } from './views/grid/grid.sites';
import { FormList } from './views/list/list';
import { Button, Header, Title, ViewButtons } from './list-view.styles';

enum View {
  List,
  Grid,
}

export const ListProvider: React.FC = () => {
  const queryClient = useQueryClient();

  queryClient.prefetchQuery(QKFieldTypes.all, fetchFieldTypes);
  queryClient.prefetchQuery(
    QKFieldTypes.propertySections(),
    fetchFieldPropertySections
  );

  const openCreateFormModal = useCreateFormModal();
  const { isFetching } = useFetchFormGroups();

  const [view, setView] = useLocalStorage('forms-list-view', View.Grid);

  return (
    <ModalProvider>
      <Breadcrumb id="form-list" label="Forms" url="/forms" />

      <Header>
        <Title>
          <LoadingText spinner loading={isFetching}>
            {translate('Forms')}
          </LoadingText>
        </Title>

        <GridSites />

        <ViewButtons className="btngroup btngroup--exclusive">
          <button
            type="button"
            className={classes('btn', View.List === view && 'active')}
            data-icon="list"
            aria-label="Display in a table"
            title={translate('Display as list')}
            onClick={() => setView(View.List)}
          />
          <button
            type="button"
            className={classes('btn', View.Grid === view && 'active')}
            data-icon="element-cards"
            title={translate('Display as cards')}
            onClick={() => setView(View.Grid)}
          />
        </ViewButtons>

        <Button className="btn submit add icon" onClick={openCreateFormModal}>
          {translate('Add new Form')}
        </Button>
      </Header>

      {view === View.List && <FormList />}
      {view === View.Grid && <FormGrid />}
    </ModalProvider>
  );
};
