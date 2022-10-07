import 'react-loading-skeleton/dist/skeleton.css';

import React from 'react';
import Skeleton from 'react-loading-skeleton';

import { ErrorBlock } from '@ff-client/app/components/notification-blocks/error/error-block';
import { useFetchFieldTypes } from '@ff-client/queries/field-types';
import { range } from '@ff-client/utils/arrays';

import { useSelectSearchedFields } from '../hooks/use-select-searched-fields';
import { FieldGroupWrapper, GroupTitle, List } from './field-group.styles';
import { Field } from './field/field';

type Props = {
  title: string;
};

export const FieldGroup: React.FC<Props> = ({ title }) => {
  const select = useSelectSearchedFields();
  const { data, isFetching, isError, error } = useFetchFieldTypes({ select });

  if (!data && isFetching) {
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
    <FieldGroupWrapper>
      <GroupTitle>{title}</GroupTitle>
      <List>
        {data.map((fieldType) => (
          <Field key={fieldType.class} fieldType={fieldType} />
        ))}
      </List>
    </FieldGroupWrapper>
  );
};
