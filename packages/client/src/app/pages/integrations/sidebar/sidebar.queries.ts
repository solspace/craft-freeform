import { QKIntegrations } from '@ff-client/queries/integrations';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { TypeDefinition } from '../integration.types';

type Instance = {
  id: string;
  uid: string;
  name: string;
  handle: string;
};

type Entry = {
  type: TypeDefinition;
  instances: Instance[];
};

type Category = {
  title: string;
  handle: string;
  entries: Entry[];
};

type NavigationResponse = Category[];

export const useIntegrationNavigation =
  (): UseQueryResult<NavigationResponse> => {
    return useQuery<NavigationResponse>({
      queryKey: QKIntegrations.navigation,
      queryFn: () =>
        axios
          .get<NavigationResponse>('/api/integrations/navigation')
          .then((res) => res.data),
      gcTime: Infinity,
      staleTime: Infinity,
    });
  };
