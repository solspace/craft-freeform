import { useAppDispatch } from '@editor/store';
import { formActions } from '@editor/store/slices/form';
import { useSiteContext } from '@ff-client/contexts/site/site.context';
import type {
  ExtendedFormType,
  Form,
  FormSettingNamespace,
} from '@ff-client/types/forms';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const QKForms = {
  all: (site: string) => ['forms', site] as const,
  single: (site: string, id: number) => [...QKForms.all(site), id] as const,
  settings: (site: string) => [...QKForms.all(site), 'settings'] as const,
};

export type FormWithStats = Form & {
  links: Array<{
    label: string;
    url: string;
    type: string;
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
  const { current } = useSiteContext();

  return useQuery<FormWithStats[], AxiosError>(
    QKForms.all(current.handle),
    () =>
      axios
        .get<FormWithStats[]>('/api/forms', {
          params: { site: current.handle },
        })
        .then((res) => res.data)
  );
};

export const useQuerySingleForm = (
  id?: number
): UseQueryResult<ExtendedFormType, AxiosError> => {
  const { current } = useSiteContext();

  return useQuery<ExtendedFormType, AxiosError>(
    QKForms.single(current.handle, id),
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
  const { current } = useSiteContext();

  return useQuery<FormSettingNamespace[], AxiosError>(
    QKForms.settings(current.handle),
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
