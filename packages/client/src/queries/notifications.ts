import { useDispatch } from 'react-redux';
import { notificationActions } from '@editor/store/slices/notifications';
import type {
  Notification,
  NotificationTemplate,
  NotificationType,
  TemplateType,
} from '@ff-client/types/notifications';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const QKNotifications = {
  all: ['notifications'] as const,
  types: () => [...QKNotifications.all, 'types'] as const,
  templates: () => [...QKNotifications.all, 'templates'] as const,
  single: (id: number) => [...QKNotifications.all, 'forms', id] as const,
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

export const useQueryFormNotifications = (
  formId: number
): UseQueryResult<Notification[], AxiosError> => {
  const dispatch = useDispatch();

  return useQuery<Notification[], AxiosError>(
    QKNotifications.single(formId),
    () =>
      axios
        .get<Notification[]>(`/api/forms/${formId}/notifications`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      onSuccess: (notifications) => {
        dispatch(notificationActions.set(notifications));
      },
    }
  );
};

export type NotificationTemplateGroups = {
  database: NotificationTemplate[];
  files: NotificationTemplate[];
};

type NotificationTemplatePayload = {
  allowedTypes: TemplateType[];
  default: TemplateType;
  templates: NotificationTemplateGroups;
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
