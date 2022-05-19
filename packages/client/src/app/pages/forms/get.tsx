import axios, { AxiosError } from 'axios';
import React from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

type Form = {
  id: number;
  name: string;
};

type RouteParams = {
  id: string;
};

export const Get: React.FC = () => {
  const { id } = useParams<RouteParams>();

  const { data, isFetching, isError, error } = useQuery(['forms', id], () =>
    axios.get<Form>(`/client/api/forms/${id}`).then((res) => res.data)
  );

  if (isFetching) {
    return <div>fetching a single form...</div>;
  }

  if (isError) {
    return <div>ERROR: {(error as AxiosError).message as string}</div>;
  }

  return (
    <div>
      Single Form {data.id} {data.name}
    </div>
  );
};
