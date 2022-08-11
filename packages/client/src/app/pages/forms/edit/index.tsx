import React from 'react';
import { Provider } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useQuerySingleForm } from '@ff-client/queries/forms';

import { Builder } from './builder/builder';
import { store } from './store/store';

type RouteParams = {
  id: string;
};

export const Edit: React.FC = () => {
  const { id } = useParams<RouteParams>();

  const { isFetching, isError, error } = useQuerySingleForm(parseInt(id));

  if (isFetching) {
    return <div>Fetching {id}...</div>;
  }

  if (isError) {
    return <div>ERROR: {error.message as string}</div>;
  }

  return (
    <Provider store={store}>
      <Builder />
    </Provider>
  );
};
