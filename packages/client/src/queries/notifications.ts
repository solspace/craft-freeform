import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { set as setNotifications } from '@ff-client/app/pages/forms/edit/store/slices/notifications';
import type {
  Notification,
  NotificationType,
} from '@ff-client/types/notifications';
import type { AxiosError } from 'axios';
import axios from 'axios';

const QKNotifications = {
  all: ['notifications'] as const,
  types: () => [...QKNotifications.all, 'types'] as const,
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
        .get<NotificationType[]>('/client/api/notification-types')
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
        dispatch(setNotifications(notifications));
      },
    }
  );
};
