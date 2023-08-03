import React from 'react';
import { ErrorBlock } from '@components/notification-blocks/error/error-block';
import { useFetchFieldTypes } from '@ff-client/queries/field-types';
import translate from '@ff-client/utils/translations';

import { FieldGroup } from '../../field-group/field-group';
import { LoaderFieldGroup } from '../../field-group/field-group.loader';
import { useSelectSearchedFields } from '../../hooks/use-select-searched-fields';

import { FieldItem } from './field-item';

const title = translate('Field Types');

export const BaseFields: React.FC = () => {
  const select = useSelectSearchedFields();
  const { data, isFetching, isError, error } = useFetchFieldTypes({ select });

  if (!data && isFetching) {
    return <LoaderFieldGroup words={[50, 70]} items={16} />;
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
