import { generateUrl } from '@ff-client/utils/urls';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { AiPlansResponse, AiUsageResponse } from './ai.types';

export const QKAi = {
  all: ['ai'] as const,
  usage: () => [...QKAi.all, 'usage'] as const,
  plans: (currency?: string) => [...QKAi.all, 'plans', currency ?? ''] as const,
};

export function fetchAiUsage(): Promise<AiUsageResponse> {
  return axios
    .get<AiUsageResponse>(generateUrl('api/ai/usage'))
    .then((res) => res.data);
}

export function fetchAiPlans(
  currency?: string | null
): Promise<AiPlansResponse> {
  const params = currency ? { currency: currency.toLowerCase() } : undefined;
  return axios
    .get<AiPlansResponse>(generateUrl('api/ai/plans'), { params })
    .then((res) => res.data);
}

export type CreateCheckoutSessionResponse = { url?: string };

export function createCheckoutSession(
  successUrl: string,
  cancelUrl: string,
  bundleKey?: string,
  currency?: string
): Promise<CreateCheckoutSessionResponse> {
  return axios
    .post<CreateCheckoutSessionResponse>(
      generateUrl('api/ai/create-checkout-session'),
      {
        success_url: successUrl,
        cancel_url: cancelUrl,
        ...(bundleKey && { bundle_key: bundleKey }),
        ...(currency && { currency }),
      }
    )
    .then((res) => res.data);
}

export type UseAiUsageQueryOptions = {
  enabled?: boolean;
};

export function useAiUsageQuery(
  options?: UseAiUsageQueryOptions
): UseQueryResult<AiUsageResponse> {
  return useQuery({
    queryKey: QKAi.usage(),
    queryFn: fetchAiUsage,
    enabled: options?.enabled ?? true,
    retry: (failureCount, error) => {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 404 || error.response?.status === 403)
      )
        return false;
      return failureCount < 2;
    },
  });
}

export function useAiPlansQuery(
  currency?: string | null
): UseQueryResult<AiPlansResponse> {
  return useQuery({
    queryKey: QKAi.plans(currency),
    queryFn: () => fetchAiPlans(currency),
    retry: (failureCount, error) => {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 404 || error.response?.status === 403)
      )
        return false;
      return failureCount < 2;
    },
  });
}
