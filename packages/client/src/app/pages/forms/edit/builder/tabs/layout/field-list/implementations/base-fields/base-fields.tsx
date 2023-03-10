import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { ErrorBlock } from '@components/notification-blocks/error/error-block';
import { useFetchFieldTypes } from '@ff-client/queries/field-types';
import { range } from '@ff-client/utils/arrays';
import translate from '@ff-client/utils/translations';

import { FieldGroup } from '../../field-group/field-group';
import { useSelectSearchedFields } from '../../hooks/use-select-searched-fields';

import { FieldItem } from './field-item';

const title = translate('Field Types');

export const BaseFields: React.FC = () => {
  const select = useSelectSearchedFields();
  const { data, isFetching, isError, error } = useFetchFieldTypes({ select });

  if (!data && isFetching) {
    return (
      <FieldGroup title={title}>
        {range(9).map((index) => (
          <Skeleton key={index} height={32} />
        ))}
      </FieldGroup>
    );
  }

  if (isError) {
    return <ErrorBlock>{error.message}</ErrorBlock>;
  }

  return (
    <FieldGroup title={title}>
      {data.map((fieldType) => (
        <FieldItem key={fieldType.typeClass} fieldType={fieldType} />
      ))}
    </FieldGroup>
  );
};
