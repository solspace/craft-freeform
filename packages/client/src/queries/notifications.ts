import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { notificationActions } from '@editor/store/slices/notifications';
import type {
  Notification,
  NotificationTemplate,
  NotificationType,
  TemplateType,
} from '@ff-client/types/notifications';
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
        .get<NotificationType[]>('/client/api/notifications/types')
        .then((res) => res.data),
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
        .get<Notification[]>(`/client/api/forms/${formId}/notifications`)
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

type NotificationTemplatePayload = {
  allowedTypes: TemplateType[];
  default: TemplateType;
  templates: {
    database: NotificationTemplate[];
    files: NotificationTemplate[];
  };
};

export const useQueryNotificationTemplates = (): UseQueryResult<
  NotificationTemplatePayload,
  AxiosError
> => {
  return useQuery<NotificationTemplatePayload, AxiosError>(
    QKNotifications.templates(),
    () =>
      axios
        .get<NotificationTemplatePayload>('/client/api/notifications/templates')
        .then((res) => res.data),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
};
