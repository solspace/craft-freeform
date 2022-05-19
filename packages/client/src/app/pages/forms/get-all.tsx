import axios, { AxiosError } from 'axios';
import React from 'react';
import { useQuery } from 'react-query';

type Form = {
  id: number;
  name: string;
};

export const GetAll: React.FC = () => {
  const { data, isFetching, isError, error } = useQuery('something', async () => {
    const response = await axios.get<Form[]>('/client/api/forms');

    console.log(response);

    return response.data;
  });

  if (isFetching) {
    return <div>fetching forms...</div>;
  }

  if (isError) {
    return <div>ERROR {(error as AxiosError).message}</div>;
  }

  return (
    <div>
      Form list
      <ul>
        {data.map((form) => (
          <li key={form.id}>{form.name}</li>
        ))}
      </ul>
    </div>
  );
};
