import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { useAppDispatch } from '@editor/store';
import { update } from '@editor/store/slices/form';
import type { Form } from '@ff-client/types/forms';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const useQueryForms = (): UseQueryResult<Form[], AxiosError> => {
  return useQuery<Form[], AxiosError>('forms', () =>
    axios.get<Form[]>('/client/api/forms').then((res) => res.data)
  );
};

export const useQuerySingleForm = (
  id?: number
): UseQueryResult<Form, AxiosError> => {
  const dispatch = useAppDispatch();

  return useQuery<Form, AxiosError>(
    ['forms', id],
    () => axios.get<Form>(`/client/api/forms/${id}`).then((res) => res.data),
    {
      staleTime: Infinity,
      enabled: !!id,
      onSuccess: (form) => {
        dispatch(update(form));
      },
    }
  );
};
