import { useAppDispatch } from '@editor/store';
import { formActions } from '@editor/store/slices/form';
import type {
    ExtendedFormType,
    Form, FormOwnership,
    FormSettingNamespace,
} from '@ff-client/types/forms';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const QKForms = {
  all: ['forms'] as const,
  single: (id: number) => [...QKForms.all, id] as const,
  settings: () => [...QKForms.all, 'settings'] as const,
  ownership: (formId: number) =>
    [...QKForms.single(formId), 'ownership'] as const,
};

export type FormWithStats = Form & {
  links: Array<{
    label: string;
    url: string;
    internal: boolean;
  }>;
  chartData: Array<{ uv: number }>;
  counters: {
    submissions: number;
    spam: number;
  };
};

export const useQueryFormsWithStats = (): UseQueryResult<
  FormWithStats[],
  AxiosError
> => {
  return useQuery<FormWithStats[], AxiosError>(QKForms.all, () =>
    axios.get<FormWithStats[]>('/api/forms').then((res) => res.data)
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
        .then((res) => res.data)
        .then((res) => res.sort((a, b) => a.order - b.order))
        .then((res) => {
          dispatch(formActions.setInitialSettings(res));

          return res;
        }),
    { staleTime: Infinity, cacheTime: Infinity }
  );
};

export const useQueryFormOwnership = (id?: number): UseQueryResult<FormOwnership, AxiosError> => {
    return useQuery<FormOwnership, AxiosError>(
        QKForms.ownership(id),
        () =>
            axios.get<FormOwnership>(`/api/forms/${id}/ownership`)
                .then((res) => res.data),
        { staleTime: Infinity }
    );
}