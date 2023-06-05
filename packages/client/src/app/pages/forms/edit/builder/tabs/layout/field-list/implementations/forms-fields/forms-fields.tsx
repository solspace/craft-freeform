import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { ErrorBlock } from '@components/notification-blocks/error/error-block';
import { formSelectors } from '@editor/store/slices/form/form.selectors';
import { useFetchForms } from '@ff-client/queries/field-forms';
import { range } from '@ff-client/utils/arrays';
import translate from '@ff-client/utils/translations';

import { FieldGroup } from '../../field-group/field-group';

import { FieldItem } from './field-item';

export const FormsFields: React.FC = () => {
  const { uid } = useSelector(formSelectors.current);
  const { data, isFetching, isError, error } = useFetchForms();

  if (!data && isFetching) {
    return (
      <FieldGroup title={translate('Other Field Types')}>
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

  const forms = data.filter((form) => form.uid !== uid);

  if (!forms.length) {
    return null;
  }

  return (
    <>
      {forms.map((form) => (
        <FieldGroup
          key={form.uid}
          title={translate(`${form.name} Field Types`)}
        >
          {form.fields.map((field) => (
            <FieldItem key={field.uid} field={field} />
          ))}
        </FieldGroup>
      ))}
    </>
  );
};
