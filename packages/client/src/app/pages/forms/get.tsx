import axios, { AxiosError } from 'axios';
import React from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

import { Builder } from '@ff-client/app/components/builder/builder';
import { Form } from '@ff-client/types/forms';

type RouteParams = {
  handle: string;
};

export const Get: React.FC = () => {
  const { handle } = useParams<RouteParams>();

  const { data, isFetching, isError, error } = useQuery(
    ['forms', handle],
    () => axios.get<Form>(`/client/api/forms/${handle}`).then((res) => res.data),
    { staleTime: Infinity }
  );

  if (isFetching) {
    return <div>Fetching {handle}...</div>;
  }

  if (isError) {
    return <div>ERROR: {(error as AxiosError).message as string}</div>;
  }

  return (
    <div>
      Single Form {data.id} {data.name}
      <Builder />
    </div>
  );
};
