import { useDispatch } from 'react-redux';
import { integrationActions } from '@editor/store/slices/integrations';
import type { Integration } from '@ff-client/types/integrations';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const QKIntegrations = {
  all: ['integrations'] as const,
  single: (id: number) => [...QKIntegrations.all, id] as const,
};

export const useQueryFormIntegrations = (
  formId?: number
): UseQueryResult<Integration[], AxiosError> => {
  const dispatch = useDispatch();

  return useQuery<Integration[], AxiosError>(
    QKIntegrations.single(formId),
    () => {
      if (!formId) {
        return Promise.resolve([]);
      }

      return axios
        .get<Integration[]>(`/api/forms/${formId}/integrations`)
        .then((res) => res.data)
        .then((res) => {
          dispatch(integrationActions.set(res));

          return res;
        });
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
};
