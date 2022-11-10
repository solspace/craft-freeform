import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { update } from '@editor/store/slices/form';
import { useAppDispatch } from '@ff-client/app/pages/forms/edit/store';
import type { FormProps } from '@ff-client/types/forms';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const useQueryForms = (): UseQueryResult<FormProps[], AxiosError> => {
  return useQuery<FormProps[], AxiosError>('forms', () =>
    axios.get<FormProps[]>('/client/api/forms').then((res) => res.data)
  );
};

export const useQuerySingleForm = (
  id?: number
): UseQueryResult<FormProps, AxiosError> => {
  const dispatch = useAppDispatch();

  return useQuery<FormProps, AxiosError>(
    ['forms', id],
    () =>
      axios.get<FormProps>(`/client/api/forms/${id}`).then((res) => res.data),
    {
      staleTime: Infinity,
      enabled: !!id,
      onSuccess: (form) => {
        dispatch(update(form));
      },
    }
  );
};
