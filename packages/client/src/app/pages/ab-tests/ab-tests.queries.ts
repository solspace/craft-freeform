import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { ABTestStatistics } from './ab-tests.types';

type Response = Record<string, ABTestStatistics>;

export const useAbTestsStatistics = (): UseQueryResult<Response> => {
  return useQuery<Response>({
    queryKey: ['ab-tests', 'statistics'],
    queryFn: () =>
      axios.get<Response>('/api/ab-tests/statistics').then((res) => res.data),
    gcTime: Infinity,
    staleTime: Infinity,
  });
};
