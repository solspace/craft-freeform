import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { useAppDispatch } from '@editor/store';
import { update } from '@editor/store/slices/form';
import type { FormType } from '@ff-client/types/forms';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const useQueryForms = (): UseQueryResult<FormType[], AxiosError> => {
  return useQuery<FormType[], AxiosError>('forms', () =>
    axios.get<FormType[]>('/client/api/forms').then((res) => res.data)
  );
};

export const useQuerySingleForm = (
  id?: number
): UseQueryResult<FormType, AxiosError> => {
  const dispatch = useAppDispatch();

  return useQuery<FormType, AxiosError>(
    ['forms', id],
    () =>
      axios.get<FormType>(`/client/api/forms/${id}`).then((res) => res.data),
    {
      staleTime: Infinity,
      enabled: !!id,
      onSuccess: (form) => {
        dispatch(update(form));
      },
    }
  );
};
