import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';

import { Form } from '@ff-client/types/forms';

export const useQueryForms = (): UseQueryResult<Form[], AxiosError> => {
  return useQuery<Form[], AxiosError>('forms', () => axios.get<Form[]>('/client/api/forms').then((res) => res.data), {
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuerySingleForm = (id: number): UseQueryResult<Form, AxiosError> => {
  return useQuery<Form, AxiosError>(
    ['forms', id],
    () => axios.get<Form>(`/client/api/forms/${id}`).then((res) => res.data),
    { staleTime: Infinity }
  );
};
