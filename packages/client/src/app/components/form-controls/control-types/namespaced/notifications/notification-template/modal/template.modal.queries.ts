import type { NotificationTemplate } from "@ff-client/types/notifications";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axios from "axios";

export const QKNotificationTemplates = {
  all: ["notification-templates"] as const,
  one: (templateId: string | number) =>
    [...QKNotificationTemplates.all, templateId] as const,
};

export const useQueryNotificationTemplate = (
  templateId?: string | number,
): UseQueryResult<NotificationTemplate, AxiosError> => {
  return useQuery({
    queryKey: QKNotificationTemplates.one(templateId),
    queryFn: () =>
      axios
        .get(
          `/api/notifications/templates/${templateId || "get-default-metadata"}`,
        )
        .then((res) => res.data),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useNotificationTemplateMutation = (
  formId?: number,
): UseMutationResult => {
  return useMutation({
    mutationFn: (payload: NotificationTemplate) => {
      return axios
        .post("/api/notifications/templates", {
          formId,
          ...payload,
        })
        .then((res) => res.data);
    },
  });
};
