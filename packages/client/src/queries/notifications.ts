import { useDispatch } from 'react-redux';
import config, { TemplateMethod } from '@config/freeform/freeform.config';
import { notificationActions } from '@editor/store/slices/notifications';
import type {
  Notification,
  NotificationTemplate,
  NotificationType,
  SuggestionCategory,
  TemplateType,
} from '@ff-client/types/notifications';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const QKNotifications = {
  all: ['notifications'] as const,
  types: () => [...QKNotifications.all, 'types'] as const,
  templates: () => [...QKNotifications.all, 'templates'] as const,
  suggestions: () => [...QKNotifications.templates(), 'suggestions'] as const,
  formTemplates: (id: number) =>
    [...QKNotifications.all, 'forms', id, 'templates'] as const,
  single: (id: number) => [...QKNotifications.all, 'forms', id] as const,
};

export const useNotificationQueryReset = (): (() => void) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries(QKNotifications.all);
  };
};

export const useQueryNotificationTypes = (): UseQueryResult<
  NotificationType[],
  AxiosError
> => {
  return useQuery<NotificationType[], AxiosError>(
    QKNotifications.types(),
    () =>
      axios
        .get<NotificationType[]>('/api/notifications/types')
        .then((res) => res.data)
        .then((res) => res.sort((a, b) => a.order - b.order)),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
};

export const useQueryNotificationSuggestions = (): UseQueryResult<
  SuggestionCategory[],
  AxiosError
> => {
  return useQuery<SuggestionCategory[], AxiosError>(
    QKNotifications.suggestions(),
    () =>
      axios
        .get<SuggestionCategory[]>('/api/templates/notifications/suggestions')
        .then((res) => res.data),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
};

export const useQueryFormNotifications = (
  formId?: number
): UseQueryResult<Notification[], AxiosError> => {
  const dispatch = useDispatch();

  return useQuery<Notification[], AxiosError>(
    QKNotifications.single(formId),
    () => {
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
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
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
  return useQuery<NotificationTemplatePayload, AxiosError>(
    QKNotifications.templates(),
    () =>
      axios
        .get<NotificationTemplatePayload>('/api/notifications/templates')
        .then((res) => res.data),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
};

export const useQueryFormNotificationTemplates = (
  formId?: number
): UseQueryResult<NotificationTemplate[], AxiosError> => {
  const {
    templates: { method },
  } = config;

  return useQuery(
    QKNotifications.formTemplates(formId),
    () =>
      axios
        .get(`/api/forms/${formId}/notifications/templates`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: method !== TemplateMethod.Global,
    }
  );
};
