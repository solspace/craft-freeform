import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { addNotifications } from '@ff-client/app/pages/forms/edit/store/slices/notifications';
import type {
  Notification,
  NotificationCategory,
} from '@ff-client/types/notifications';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const useQueryNotifications = (): UseQueryResult<
  NotificationCategory[],
  AxiosError
> => {
  return useQuery<NotificationCategory[], AxiosError>(
    ['notifications'],
    () =>
      axios
        .get<NotificationCategory[]>(`/client/api/notifications`)
        .then((res) => res.data),
    { staleTime: Infinity }
  );
};

export const useQueryFormNotifications = (
  formId: number
): UseQueryResult<Notification[], AxiosError> => {
  const dispatch = useDispatch();

  return useQuery<Notification[], AxiosError>(
    ['form-notifications'],
    () =>
      axios
        .get<Notification[]>(`/client/api/forms/${formId}/notifications`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      onSuccess: (notifications) => {
        dispatch(addNotifications(notifications));
      },
    }
  );
};

export const useQuerySingleFormNotification = (
  formId: number,
  id: number
): UseQueryResult<Notification, AxiosError> => {
  return useQuery<Notification, AxiosError>(
    ['form-notifications', id],
    () =>
      axios
        .get<Notification>(`/client/api/forms/${formId}/notifications/${id}`)
        .then((res) => res.data),
    { staleTime: Infinity }
  );
};
