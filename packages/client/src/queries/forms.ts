import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import type {
  ExtendedFormType,
  Form,
  FormSettingNamespace,
} from '@ff-client/types/forms';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const useQueryForms = (): UseQueryResult<Form[], AxiosError> => {
  return useQuery<Form[], AxiosError>('forms', () =>
    axios.get<Form[]>('/client/api/forms').then((res) => res.data)
  );
};

export const useQuerySingleForm = (
  id?: number
): UseQueryResult<ExtendedFormType, AxiosError> => {
  return useQuery<ExtendedFormType, AxiosError>(
    ['forms', id],
    () =>
      axios
        .get<ExtendedFormType>(`/client/api/forms/${id}`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      enabled: !!id,
    }
  );
};

export const useQueryFormSettings = (): UseQueryResult<
  FormSettingNamespace[],
  AxiosError
> => {
  return useQuery<FormSettingNamespace[], AxiosError>(
    ['forms', 'settings'],
    () =>
      axios
        .get<FormSettingNamespace[]>(`/client/api/forms/settings`)
        .then((res) => res.data)
  );
};
