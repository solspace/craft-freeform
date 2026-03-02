import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type DailyMetric = {
  date: string;
  spend: number;
  api_requests: number;
  successful_requests: number;
  failed_requests: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export type AiUsageResponse = {
  user_id?: string;
  summary?: {
    total_spend?: number;
    total_requests?: number | null;
    account_email?: string;
    created_at?: string;
    max_budget?: number | null;
    budget_unlimited?: boolean;
    credit_remaining?: number | null;
    budget_duration?: string | null;
  };
  daily_metrics?: DailyMetric[];
};

export function isSolspaceAiUsageResponse(
  data: AiUsageResponse | null | undefined
): data is AiUsageResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'summary' in data &&
    typeof (data as AiUsageResponse).summary === 'object'
  );
}

export const QKAi = {
  all: ['ai'] as const,
  usage: () => [...QKAi.all, 'usage'] as const,
  spendReport: (start?: string, end?: string) =>
    [...QKAi.all, 'spend-report', start, end] as const,
};

export function fetchAiUsage(): Promise<AiUsageResponse> {
  return axios.get<AiUsageResponse>('/api/ai/usage').then((res) => res.data);
}

export type CreateCheckoutSessionResponse = { url?: string };

export function createCheckoutSession(
  successUrl: string,
  cancelUrl: string
): Promise<CreateCheckoutSessionResponse> {
  return axios
    .post<CreateCheckoutSessionResponse>('/api/ai/create-checkout-session', {
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
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
