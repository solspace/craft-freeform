import { useQueryFormColors } from "@ff-client/queries/forms";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

import type {
  ABTestDashboardItem,
  ABTestStatistics,
  ABTestWithVariants,
} from "./ab-tests.types";

type Response = Record<string, ABTestStatistics>;

export const QKAbTests = {
  base: ["ab-tests"] as const,
  dashboard: () => [...QKAbTests.base, "dashboard"] as const,
};

export const useAbTestsStatistics = (): UseQueryResult<Response> => {
  return useQuery<Response>({
    queryKey: ["ab-tests", "statistics"],
    queryFn: () =>
      axios.get<Response>("/api/ab-tests/statistics").then((res) => res.data),
    gcTime: Infinity,
    staleTime: Infinity,
  });
};

export const useAbTestsDashboard = (): ABTestDashboardItem[] => {
  const formColors = useQueryFormColors();
  const { data } = useQuery<ABTestDashboardItem[]>({
    queryKey: QKAbTests.dashboard(),
    queryFn: () =>
      axios
        .get<ABTestDashboardItem[]>("/api/ab-tests/dashboard")
        .then((res) => res.data),
  });

  const testsWithColors = useMemo(
    () =>
      data?.map((test) => ({
        ...test,
        variants: test.variants.map((variant) => ({
          ...variant,
          formColor: variant.formColor || formColors[variant.formId] || null,
        })),
      })) || [],
    [data, formColors],
  );

  return testsWithColors;
};

export const useAbTestUpsertMutation = (
  id?: number,
): UseMutationResult<{ id: number }, unknown, ABTestWithVariants> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ABTestWithVariants) => {
      const payload = { ...values };

      if (!id) {
        return axios.post("/api/ab-tests", payload).then((res) => res.data);
      }

      return axios.post(`/api/ab-tests/${id}`, payload).then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QKAbTests.base });
    },
  });
};

export const useAbTestDeleteMutation = (): UseMutationResult<
  { success: boolean },
  unknown,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      axios
        .post<{ success: boolean }>(`/api/ab-tests/${id}/delete`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QKAbTests.base });
    },
  });
};
