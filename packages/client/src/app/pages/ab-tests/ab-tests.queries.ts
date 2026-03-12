import type { UseQueryResult } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import type {
  ABTestDashboardItem,
  ABTestStatistics,
  ABTestWithVariants,
} from './ab-tests.types';

type Response = Record<string, ABTestStatistics>;

export const QKAbTests = {
  base: ['ab-tests'] as const,
  dashboard: () => [...QKAbTests.base, 'dashboard'] as const,
};

export const useAbTestsStatistics = (): UseQueryResult<Response> => {
  return useQuery<Response>({
    queryKey: ['ab-tests', 'statistics'],
    queryFn: () =>
      axios.get<Response>('/api/ab-tests/statistics').then((res) => res.data),
    gcTime: Infinity,
    staleTime: Infinity,
  });
};

export const useAbTestsDashboard = (): UseQueryResult<
  ABTestDashboardItem[]
> => {
  return useQuery<ABTestDashboardItem[]>({
    queryKey: QKAbTests.dashboard(),
    queryFn: () =>
      axios
        .get<ABTestDashboardItem[]>('/api/ab-tests/dashboard')
        .then((res) => res.data),
  });
};

export const useAbTestUpsertMutation = (
  id?: number
): UseMutationResult<{ id: number }, unknown, ABTestWithVariants> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ABTestWithVariants) => {
      const payload = { ...values };

      if (!id) {
        return axios.post('/api/ab-tests', payload).then((res) => res.data);
      }

      return axios.post(`/api/ab-tests/${id}`, payload).then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QKAbTests.base });
    },
  });
};
