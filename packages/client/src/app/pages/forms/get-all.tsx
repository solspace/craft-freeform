import axios, { AxiosError } from 'axios';
import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

import { Form } from '@ff-client/types/forms';

export const GetAll: React.FC = () => {
  const { data, isFetching, isError, error } = useQuery<Form[], AxiosError>(
    'forms',
    () => axios.get<Form[]>('/client/api/forms').then((res) => res.data),
    { staleTime: 1000 * 60 * 5 }
  );

  if (isFetching) {
    return <div>fetching forms...</div>;
  }

  if (isError) {
    return <div>ERROR {error.message}</div>;
  }

  return (
    <div>
      Form list
      <ul>
        {data.map((form) => (
          <li key={form.id}>
            <Link to={form.handle}>{form.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
