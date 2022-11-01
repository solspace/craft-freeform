import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { addIntegrations } from '@ff-client/app/pages/forms/edit/store/slices/integrations';
import type {
  Integration,
  IntegrationCategory,
} from '@ff-client/types/integrations';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const useQueryIntegrations = (): UseQueryResult<
  IntegrationCategory[],
  AxiosError
> => {
  return useQuery<IntegrationCategory[], AxiosError>(
    ['integrations'],
    () =>
      axios
        .get<IntegrationCategory[]>(`/client/api/integrations`)
        .then((res) => res.data),
    { staleTime: Infinity }
  );
};

export const useQueryFormIntegrations = (
  formId: number
): UseQueryResult<Integration[], AxiosError> => {
  const dispatch = useDispatch();

  return useQuery<Integration[], AxiosError>(
    ['form-integrations'],
    () =>
      axios
        .get<Integration[]>(`/client/api/forms/${formId}/integrations`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      onSuccess: (integrations) => {
        dispatch(addIntegrations(integrations));
      },
    }
  );
};

export const useQuerySingleFormIntegration = (
  formId: number,
  id: number
): UseQueryResult<Integration, AxiosError> => {
  return useQuery<Integration, AxiosError>(
    ['form-integrations', id],
    () =>
      axios
        .get<Integration>(`/client/api/forms/${formId}/integrations/${id}`)
        .then((res) => res.data),
    { staleTime: Infinity }
  );
};
