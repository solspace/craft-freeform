import { useQuerySingleForm } from '@ff-client/queries/forms';
import React from 'react';
import { Provider } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Builder } from './builder/builder';
import { EditorGlobalStyles } from './edit.styles';
import { store } from './store/store';

type RouteParams = {
  formId: string;
};

export const Edit: React.FC = () => {
  const { formId } = useParams<RouteParams>();

  const { isFetching, isError, error } = useQuerySingleForm(Number(formId));

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
