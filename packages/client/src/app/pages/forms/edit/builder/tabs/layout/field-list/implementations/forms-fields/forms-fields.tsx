import React from 'react';
import { useSelector } from 'react-redux';
import { ErrorBlock } from '@components/notification-blocks/error/error-block';
import { formSelectors } from '@editor/store/slices/form/form.selectors';
import { useFetchForms } from '@ff-client/queries/field-forms';
import translate from '@ff-client/utils/translations';

import { GroupTitle } from '../../field-group/field-group.styles';
import { useSelectSearchedForms } from '../../hooks/use-select-searched-fields';

import { FormBlock } from './form-block';
import { FormFieldsWrapper } from './forms-fields.styles';

export const FormsFields: React.FC = () => {
  const { uid } = useSelector(formSelectors.current);

  const select = useSelectSearchedForms();
  const { data, isFetching, isError, error } = useFetchForms({ select });

  if (!data && isFetching) {
    return null;
  }

  if (isError) {
    return <ErrorBlock>{error.message}</ErrorBlock>;
  }

  if (!data || !data.length) {
    return null;
  }

  const forms = data.filter((form) => form.uid !== uid);
  const hasFields = forms.some((form) => form.fields.length > 0);

  if (!forms.length || !hasFields) {
    return null;
  }

  return (
    <FormFieldsWrapper>
      <GroupTitle>{translate('Fields from other Forms')}</GroupTitle>
      {forms.map((form) => (
        <FormBlock key={form.uid} form={form} />
      ))}
    </FormFieldsWrapper>
  );
};
