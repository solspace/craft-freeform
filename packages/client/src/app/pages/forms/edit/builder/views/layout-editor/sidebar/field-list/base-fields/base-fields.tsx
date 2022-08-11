import 'react-loading-skeleton/dist/skeleton.css';

import React from 'react';
import Skeleton from 'react-loading-skeleton';

import { ErrorBlock } from '@ff-client/app/components/notification-blocks/error/error-block';
import { useFetchFieldTypes } from '@ff-client/queries/field-types';
import { range } from '@ff-client/utils/arrays';

import { List } from './base-fields.styles';
import { Field } from './field/field';

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
        <Field key={fieldType.class} fieldType={fieldType} />
      ))}
    </List>
  );
};
