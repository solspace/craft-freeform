import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { integrationActions } from '@editor/store/slices/integrations';
import type { Integration } from '@ff-client/types/integrations';
import type { AxiosError } from 'axios';
import axios from 'axios';

const QKIntegrations = {
  all: ['integrations'] as const,
  single: (id: number) => [...QKIntegrations.all, id] as const,
};

export const useQueryFormIntegrations = (
  formId: number
): UseQueryResult<Integration[], AxiosError> => {
  const dispatch = useDispatch();

  return useQuery<Integration[], AxiosError>(
    QKIntegrations.single(formId),
    () =>
      axios
        .get<Integration[]>(`/api/forms/${formId}/integrations`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      onSuccess: (integrations) => {
        dispatch(integrationActions.add(integrations));
      },
    }
  );
};
