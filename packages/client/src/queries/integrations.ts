import { integrationActions } from "@editor/store/slices/integrations";
import type { Integration } from "@ff-client/types/integrations";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axios from "axios";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

export const QKIntegrations = {
  all: ["integrations"] as const,
  form: (formId?: number) => [...QKIntegrations.all, "forms", formId] as const,
  navigation: ["integrations", "navigation"] as const,
  properties: (type: string, integration: string, id: string) =>
    [...QKIntegrations.all, "properties", type, integration, id] as const,
  authCheck: (id: number) => [...QKIntegrations.all, id, "auth-check"] as const,
};

export const useFormIntegrationsQueryReset = (
  formId?: number,
): (() => void) => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    if (!formId) {
      return;
    }

    queryClient.removeQueries({ queryKey: QKIntegrations.form(formId) });
  }, [formId, queryClient]);
};

export const useQueryFormIntegrations = (
  formId?: number,
): UseQueryResult<Integration[], AxiosError> => {
  const dispatch = useDispatch();

  return useQuery<Integration[], AxiosError>({
    queryKey: QKIntegrations.form(formId),
    queryFn: () => {
      if (!formId) {
        return Promise.resolve([]);
      }

      return axios
        .get<Integration[]>(`/api/forms/${formId}/integrations`)
        .then((res) => res.data)
        .then((res) => {
          dispatch(integrationActions.set(res));

          return res;
        });
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
