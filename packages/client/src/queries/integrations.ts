import { Integration } from '@ff-client/types/integrations';
import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';

export const useQueryIntegrations = (
  formId: number
): UseQueryResult<Integration[], AxiosError> => {
  return useQuery<Integration[], AxiosError>(['integrations'], () =>
    axios
      .get<Integration[]>(`/client/api/forms/${formId}/integrations`)
      .then((res) => res.data)
  );
};

export const useQuerySingleIntegration = (
  id: number
): UseQueryResult<Integration, AxiosError> => {
  return useQuery<Integration, AxiosError>(
    ['integrations', id],
    () =>
      axios
        .get<Integration>(`/client/api/integrations/${id}`)
        .then((res) => res.data),
    { staleTime: Infinity }
  );
};
