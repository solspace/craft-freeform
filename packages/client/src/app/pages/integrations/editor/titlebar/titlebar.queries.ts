import { QKIntegrations } from '@ff-client/queries/integrations';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { AuthState, Integration } from '../../integration.types';

type Response = {
  status: AuthState;
  errors: string[];
};

export const useAuthCheck = (
  integration: Integration
): UseQueryResult<Response> => {
  const { id } = integration;

  return useQuery<Response>(QKIntegrations.authCheck(id), {
    enabled: !!id && integration.implements.includes('apiIntegration'),
    queryFn: async () =>
      axios
        .get(`/api/integrations/${id}/status`)
        .then((response) => response.data),
  });
};
