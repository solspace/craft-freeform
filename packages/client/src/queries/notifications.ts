import config, { TemplateMethod } from "@config/freeform/freeform.config";
import { notificationActions } from "@editor/store/slices/notifications";
import type {
  Notification,
  NotificationTemplate,
  NotificationType,
  SuggestionCategory,
  TemplateType,
} from "@ff-client/types/notifications";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axios from "axios";
import { useDispatch } from "react-redux";

export const QKNotifications = {
  all: ["notifications"] as const,
  types: () => [...QKNotifications.all, "types"] as const,
  templates: () => [...QKNotifications.all, "templates"] as const,
  suggestions: () => [...QKNotifications.templates(), "suggestions"] as const,
  formTemplates: (id: number) =>
    [...QKNotifications.all, "forms", id, "templates"] as const,
  single: (id: number) => [...QKNotifications.all, "forms", id] as const,
};

export const useNotificationQueryReset = (): (() => void) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries({ queryKey: QKNotifications.all });
  };
};

export const useQueryNotificationTypes = (): UseQueryResult<
  NotificationType[],
  AxiosError
> => {
  return useQuery<NotificationType[], AxiosError>({
    queryKey: QKNotifications.types(),
    queryFn: () =>
      axios
        .get<NotificationType[]>("/api/notifications/types")
        .then((res) => res.data)
        .then((res) => res.sort((a, b) => a.order - b.order)),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useQueryNotificationSuggestions = (): UseQueryResult<
  SuggestionCategory[],
  AxiosError
> => {
  return useQuery<SuggestionCategory[], AxiosError>({
    queryKey: QKNotifications.suggestions(),
    queryFn: () =>
      axios
        .get<SuggestionCategory[]>("/api/templates/notifications/suggestions")
        .then((res) => res.data),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useQueryFormNotifications = (
  formId?: number,
): UseQueryResult<Notification[], AxiosError> => {
  const dispatch = useDispatch();

  return useQuery<Notification[], AxiosError>({
    queryKey: QKNotifications.single(formId),
    queryFn: () => {
      if (!formId) {
        return Promise.resolve([]);
      }

      return axios
        .get<Notification[]>(`/api/forms/${formId}/notifications`)
        .then((res) => res.data)
        .then((res) => {
          dispatch(notificationActions.set(res));

          return res;
        });
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export type NotificationTemplateGroups = {
  form?: NotificationTemplate[];
  global: NotificationTemplate[];
};

type NotificationTemplatePayload = {
  default: TemplateType;
  templates: NotificationTemplate[];
};

export const useQueryNotificationTemplates = (): UseQueryResult<
  NotificationTemplatePayload,
  AxiosError
> => {
  return useQuery<NotificationTemplatePayload, AxiosError>({
    queryKey: QKNotifications.templates(),
    queryFn: () =>
      axios
        .get<NotificationTemplatePayload>("/api/notifications/templates")
        .then((res) => res.data),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useQueryFormNotificationTemplates = (
  formId?: number,
): UseQueryResult<NotificationTemplate[], AxiosError> => {
  const {
    templates: { method },
  } = config;

  return useQuery({
    queryKey: QKNotifications.formTemplates(formId),
    queryFn: () =>
      axios
        .get(`/api/forms/${formId}/notifications/templates`)
        .then((res) => res.data),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: method !== TemplateMethod.Global,
  });
};
