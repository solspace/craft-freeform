import { QKIntegrations } from '@ff-client/queries/integrations';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type AiIntegrationOption = {
  id: number;
  uid: string;
  name: string;
  handle: string;
};

type Instance = {
  id: string;
  uid: string;
  name: string;
  handle: string;
};

type Entry = {
  type: unknown;
  instances: Instance[];
};

type Category = {
  title: string;
  handle: string;
  entries: Entry[];
};

type NavigationResponse = Category[];

export const useAiIntegrations = (): UseQueryResult<AiIntegrationOption[]> => {
  return useQuery({
    queryKey: [...QKIntegrations.navigation, 'ai-list'],
    queryFn: async () => {
      const { data } = await axios.get<NavigationResponse>(
        '/api/integrations/navigation'
      );
      const aiCategory = data?.find((c) => c.handle === 'ai');
      if (!aiCategory) return [];
      const list = aiCategory.entries.flatMap((e) => e.instances);
      return list.map((i) => ({
        id: Number(i.id),
        uid: i.uid,
        name: i.name,
        handle: i.handle,
      }));
    },
    gcTime: Infinity,
    staleTime: 60_000,
  });
};
