import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { ABTest } from '../ab-tests.types';

type NavigationResponse = ABTest[];

export const useAbTestsList = (): UseQueryResult<NavigationResponse> => {
  return useQuery<NavigationResponse>({
    queryKey: ['ab-tests', 'list'],
    queryFn: () =>
      axios.get<NavigationResponse>('/api/ab-tests').then((res) => res.data),
    gcTime: Infinity,
    staleTime: Infinity,
  });
};
