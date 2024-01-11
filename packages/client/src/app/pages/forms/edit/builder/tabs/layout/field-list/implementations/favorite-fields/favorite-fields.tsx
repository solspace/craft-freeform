import React from 'react';
import { ErrorBlock } from '@components/notification-blocks/error/error-block';
import { useFetchFavorites } from '@ff-client/queries/field-favorites';
import translate from '@ff-client/utils/translations';
import EditIcon from '@ff-icons/actions/edit.icon.svg';

import { FieldGroup } from '../../field-group/field-group';
import { LoaderFieldGroup } from '../../field-group/field-group.loader';
import { List } from '../../field-group/field-group.styles';
import { useSelectSearchedFavorites } from '../../hooks/use-select-searched-fields';

import { useCreateModal } from './modal/use-create-modal';
import { FieldItem } from './field-item';

const title = translate('Favorites');

export const FavoriteFields: React.FC = () => {
  const select = useSelectSearchedFavorites();
  const { data, isFetching, isError, error } = useFetchFavorites({ select });
  const openModal = useCreateModal();

  if (!data && isFetching) {
    return <LoaderFieldGroup words={[60]} items={2} />;
  }

  if (isError) {
    return <ErrorBlock>{error.message}</ErrorBlock>;
  }

  if (!data.length) {
    return null;
  }

  return (
    <FieldGroup
      title={title}
      button={{
        icon: <EditIcon />,
        title: translate('Edit Favorites'),
        onClick: openModal,
      }}
    >
      <List>
        {data.map((favorite) => (
          <FieldItem key={favorite.uid} favorite={favorite} />
        ))}
      </List>
    </FieldGroup>
  );
};
