import type {
  FormTestsResponse,
  TestStats,
} from "@ff-client/types/form-monitor";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axios from "axios";

export const QKFormMonitor = {
  base: ["form-monitor"] as const,
  tests: (formId: number, params?: { limit?: number; offset?: number }) =>
    [...QKFormMonitor.base, "tests", formId, params] as const,
  stats: (formId: number) => [...QKFormMonitor.base, "stats", formId] as const,
  testEmailHistory: (params?: { limit?: number; offset?: number }) =>
    [...QKFormMonitor.base, "test-email-history", params] as const,
  testEmailStatus: (token: string) =>
    [...QKFormMonitor.base, "test-email-status", token] as const,
  mailerInfo: () => [...QKFormMonitor.base, "mailer-info"] as const,
};

export const useFMFormTestsQuery = (
  formId: number,
  params: { limit?: number; offset?: number } = {},
): UseQueryResult<FormTestsResponse, AxiosError> => {
  const { limit = 100, offset = 0 } = params;

  return useQuery({
    queryKey: QKFormMonitor.tests(formId, { limit, offset }),
    queryFn: () =>
      axios
        .get<FormTestsResponse>(`/api/form-monitor/forms/${formId}/tests`, {
          params: { limit, offset },
        })
        .then((res) => res.data),
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: !!formId,
  });
};

export const useFMFormStatsQuery = (
  formId: number,
  options?: { enabled?: boolean },
): UseQueryResult<TestStats, AxiosError> => {
  return useQuery({
    queryKey: QKFormMonitor.stats(formId),
    queryFn: () =>
      axios
        .get<TestStats>(`/api/form-monitor/forms/${formId}/stats`)
        .then((res) => res.data),
    enabled: options?.enabled ?? !!formId,
  });
};

export type TestEmailHistoryItem = {
  id: number;
  testToken: string;
  status: "pending" | "success" | "failed";
  errorMessage: string | null;
  createdAt: string;
  verifiedAt: string | null;
  updatedAt: string;
};

export type TestEmailHistoryResponse = {
  testEmails: TestEmailHistoryItem[];
  total: number;
  limit: number;
  offset: number;
};

export type TestEmailStatusResponse = {
  status: "pending" | "success" | "failed";
  errorMessage: string | null;
  createdAt: string;
  verifiedAt: string | null;
};

export const useTestEmailHistoryQuery = (
  formId: number,
  params: { limit?: number; offset?: number } = {},
): UseQueryResult<TestEmailHistoryResponse, AxiosError> => {
  const { limit = 50, offset = 0 } = params;

  return useQuery({
    queryKey: QKFormMonitor.testEmailHistory({ limit, offset }),
    queryFn: () =>
      axios
        .get<TestEmailHistoryResponse>(`/api/form-monitor/test-email/history`, {
          params: { limit, offset },
        })
        .then((res) => res.data),
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: !!formId,
  });
};

export const useTestEmailStatusQuery = (
  testToken: string | null,
  options?: { enabled?: boolean; refetchInterval?: number },
): UseQueryResult<TestEmailStatusResponse, AxiosError> => {
  return useQuery({
    queryKey: QKFormMonitor.testEmailStatus(testToken || ""),
    queryFn: () =>
      axios
        .get<TestEmailStatusResponse>(`/api/form-monitor/test-email/status`, {
          params: { token: testToken },
        })
        .then((res) => res.data),
    enabled: (options?.enabled ?? true) && !!testToken,
    refetchInterval: options?.refetchInterval ?? false,
  });
};

export type SendTestEmailResponse = {
  success: boolean;
  testToken: string;
  testEmailId?: number;
};

export const useSendTestEmailMutation = (
  formId: number,
  options?: {
    onSuccess?: (data: SendTestEmailResponse) => void;
    onError?: (error: AxiosError) => void;
  },
): UseMutationResult<SendTestEmailResponse, AxiosError, void> => {
  return useMutation({
    mutationFn: () =>
      axios
        .post<SendTestEmailResponse>(`/api/form-monitor/test-email`, {
          formId,
        })
        .then((res) => res.data),
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export type MailerInfoResponse = {
  transportType: string;
  isSendmail: boolean;
};

export const useMailerInfoQuery = (): UseQueryResult<
  MailerInfoResponse,
  AxiosError
> => {
  return useQuery({
    queryKey: QKFormMonitor.mailerInfo(),
    queryFn: () =>
      axios
        .get<MailerInfoResponse>(`/api/form-monitor/mailer-info`)
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
