import React from 'react';
import { useParams } from 'react-router-dom';
import {
  useQueryEditableProperties,
  useQuerySingleForm,
} from '@ff-client/queries/forms';

import { Builder } from './builder/builder';

type RouteParams = {
  formId: string;
};

export const Edit: React.FC = () => {
  const { formId } = useParams<RouteParams>();

  const results = useQueryEditableProperties();
  // console.log('results', results);

  const { isFetching, isError, error } = useQuerySingleForm(
    formId && Number(formId)
  );

  if (isFetching) {
    return <div>Fetching {formId}...</div>;
  }

  if (isError) {
    return <div>ERROR: {error.message as string}</div>;
  }

  return <Builder />;
};
