import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type IntegrationType = {
  name: string;
  shortName: string;
  version: string;
  class: string;
  type: string;
  icon: string;
};

type Instance = {
  id: string;
  uid: string;
  name: string;
  handle: string;
};

type Entry = {
  type: IntegrationType;
  instances: Instance[];
};

type Category = {
  title: string;
  handle: string;
  entries: Entry[];
};

type NavigationResponse = Category[];

export const useNavigation = (): UseQueryResult<NavigationResponse> => {
  return useQuery<NavigationResponse>(['integrations', 'navigation'], {
    queryFn: () =>
      axios
        .get<NavigationResponse>('/api/integrations/navigation')
        .then((res) => res.data),
  });
};
