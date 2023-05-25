import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { useAppDispatch } from '@editor/store';
import { formActions } from '@editor/store/slices/form';
import type {
  ExtendedFormType,
  Form,
  FormSettingNamespace,
} from '@ff-client/types/forms';
import type { AxiosError } from 'axios';
import axios from 'axios';

const QKForms = {
  all: ['forms'] as const,
  single: (id: number) => [...QKForms.all, id] as const,
  settings: () => [...QKForms.all, 'settings'] as const,
};

export const useQueryForms = (): UseQueryResult<Form[], AxiosError> => {
  return useQuery<Form[], AxiosError>(QKForms.all, () =>
    axios.get<Form[]>('/api/forms').then((res) => res.data)
  );
};

export const useQuerySingleForm = (
  id?: number
): UseQueryResult<ExtendedFormType, AxiosError> => {
  return useQuery<ExtendedFormType, AxiosError>(
    QKForms.single(id),
    () =>
      axios.get<ExtendedFormType>(`/api/forms/${id}`).then((res) => res.data),
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
  const dispatch = useAppDispatch();

  return useQuery<FormSettingNamespace[], AxiosError>(
    QKForms.settings(),
    () =>
      axios
        .get<FormSettingNamespace[]>(`/api/forms/settings`)
        .then((res) => res.data),
    {
      onSuccess: (settings) => {
        dispatch(formActions.setInitialSettings(settings));
      },
    }
  );
};
