import React from 'react';
import { Provider } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useQuerySingleForm } from '@ff-client/queries/forms';

import { Builder } from './builder/builder';
import { store } from './store/store';
import { EditorGlobalStyles } from './edit.styles';

type RouteParams = {
  formId: string;
};

export const Edit: React.FC = () => {
  const { formId } = useParams<RouteParams>();

  const { isFetching, isError, error } = useQuerySingleForm(
    formId && Number(formId)
  );

  if (isFetching) {
    return <div>Fetching {formId}...</div>;
  }

  if (isError) {
    return <div>ERROR: {error.message as string}</div>;
  }

  return (
    <Provider store={store}>
      <EditorGlobalStyles />
      <Builder />
    </Provider>
  );
};
