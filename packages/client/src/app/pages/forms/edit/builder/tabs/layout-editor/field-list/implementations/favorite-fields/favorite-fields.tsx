import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { ErrorBlock } from '@components/notification-blocks/error/error-block';
import { useFetchFavorites } from '@ff-client/queries/field-favorites';
import { range } from '@ff-client/utils/arrays';
import translate from '@ff-client/utils/translations';

import { FieldGroup } from '../../field-group/field-group';
import { useSelectSearchedFavorites } from '../../hooks/use-select-searched-fields';

import { FieldItem } from './field-item';

const title = translate('Favorites');

export const FavoriteFields: React.FC = () => {
  const select = useSelectSearchedFavorites();
  const { data, isFetching, isError, error } = useFetchFavorites({ select });

  if (!data && isFetching) {
    return (
      <FieldGroup title={title}>
        {range(2).map((index) => (
          <Skeleton key={index} height={32} />
        ))}
      </FieldGroup>
    );
  }

  if (isError) {
    return <ErrorBlock>{error.message}</ErrorBlock>;
  }

  if (!data.length) {
    return null;
  }

  return (
    <FieldGroup title={title}>
      {data.map((favorite) => (
        <FieldItem key={favorite.uid} favorite={favorite} />
      ))}
    </FieldGroup>
  );
};
