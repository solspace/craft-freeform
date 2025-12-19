import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { ABTestWithVariants } from '../ab-tests.types';

type NavigationResponse = ABTestWithVariants[];

export const useAbTestsList = (): UseQueryResult<NavigationResponse> => {
  return useQuery<NavigationResponse>({
    queryKey: ['ab-tests', 'list'],
    queryFn: () =>
      axios.get<NavigationResponse>('/api/ab-tests').then((res) => res.data),
    gcTime: Infinity,
    staleTime: Infinity,
  });
};
