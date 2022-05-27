import 'react-loading-skeleton/dist/skeleton.css';

import React from 'react';
import Skeleton from 'react-loading-skeleton';

import { ErrorBlock } from '@ff-client/app/components/notification-blocks/error/error-block';
import { range } from '@ff-client/utils/arrays';

import { useFetchFieldTypes } from './base-fields.queries';
import { FieldName, Icon, List, ListItem } from './base-fields.styles';

export const BaseFields: React.FC = () => {
  const { data, isFetching, isError, error } = useFetchFieldTypes();

  if (isFetching) {
    return (
      <List>
        {range(9).map((index) => (
          <Skeleton key={index} height={32} />
        ))}
      </List>
    );
  }

  if (isError) {
    return <ErrorBlock>{error.message}</ErrorBlock>;
  }

  return (
    <List>
      {data.map((fieldType) => (
        <ListItem key={fieldType.class}>
          <Icon dangerouslySetInnerHTML={{ __html: fieldType.icon }} />
          <FieldName>{fieldType.name}</FieldName>
        </ListItem>
      ))}
    </List>
  );
};
