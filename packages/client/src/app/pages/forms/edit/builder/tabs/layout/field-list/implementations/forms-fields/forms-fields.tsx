import React from 'react';
import { useSelector } from 'react-redux';
import { ErrorBlock } from '@components/notification-blocks/error/error-block';
import { formSelectors } from '@editor/store/slices/form/form.selectors';
import { useFetchForms } from '@ff-client/queries/field-forms';
import translate from '@ff-client/utils/translations';

import { FieldGroup } from '../../field-group/field-group';
import { LoaderFieldGroup } from '../../field-group/field-group.loader';

import { FieldItem } from './field-item';

export const FormsFields: React.FC = () => {
  const { uid } = useSelector(formSelectors.current);
  const { data, isFetching, isError, error } = useFetchForms();

  if (!data && isFetching) {
    return <LoaderFieldGroup words={[50, 50, 70]} items={6} />;
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
