import { generateUrl } from '@ff-client/utils/urls';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type AiUsageResponse = {
  mode?: 'trial' | 'plan' | 'blocked' | 'unknown';
  is_trial?: boolean;
  trial_days_remaining?: number | null;
  trial_expires_at?: string | null;
  trial_percent_used?: number | null;
  plan_name?: string | null;
  plan_percent_remaining?: number | null;
  can_use_ai?: boolean;
  credits_total?: number | null;
  credits_remaining?: number | null;
  lifetime_credits_purchased?: number | null;
  user_email?: string | null;
  created_at?: string | null;
  payment_history?: {
    package_price?: number;
    credits?: number;
    amount_added?: number;
    paid_at?: string;
  }[];
  daily_metrics?: {
    date: string;
    credits: number;
    api_requests: number;
    successful_requests: number;
    failed_requests: number;
  }[];
  request_logs?: {
    date: string | null;
    status: 'success' | 'failure' | string;
    credits: number | null;
    request_id: string;
  }[];
};

export type CreditBundlePlan = {
  key: string;
  price: number;
  currency: string;
  credits: number;
  label: string;
  suggested?: boolean;
};

export type AiPlansResponse = {
  cost_per_credit: number;
  trial_credits?: number | null;
  bundles: CreditBundlePlan[];
  currency?: string;
};

export const QKAi = {
  all: ['ai'] as const,
  usage: () => [...QKAi.all, 'usage'] as const,
  plans: (currency?: string) => [...QKAi.all, 'plans', currency ?? ''] as const,
  spendReport: (start?: string, end?: string) =>
    [...QKAi.all, 'spend-report', start, end] as const,
};

export function fetchAiUsage(): Promise<AiUsageResponse> {
  return axios
    .get<AiUsageResponse>(generateUrl('api/ai/usage'))
    .then((res) => res.data);
}

export function fetchAiPlans(currency?: string): Promise<AiPlansResponse> {
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

export function useAiUsageQuery(): UseQueryResult<AiUsageResponse> {
  return useQuery({
    queryKey: QKAi.usage(),
    queryFn: fetchAiUsage,
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
  currency?: string
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
