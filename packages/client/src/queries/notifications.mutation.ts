import type { APIError } from '@ff-client/types/api';
import type { NotificationTemplate } from '@ff-client/types/notifications';
import type { UseMutationResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

import { QKNotifications } from './notifications';

type Payload = {
  name: string;
};

type NewNotificationTemplateMutation = (
  payload: Payload
) => Promise<AxiosResponse<NotificationTemplate>>;

const newNotificationTemplateMutation: NewNotificationTemplateMutation = (
  payload: Payload
) => {
  return axios.post<NotificationTemplate>(
    '/api/notifications/templates',
    payload
  );
};

export type NewNotificationTemplateMutationResult = UseMutationResult<
  AxiosResponse<NotificationTemplate>,
  APIError,
  Payload
>;

export const useNewNotificationMutation =
  (): NewNotificationTemplateMutationResult => {
    const queryClient = useQueryClient();

    return useMutation<AxiosResponse<NotificationTemplate>, APIError, Payload>(
      newNotificationTemplateMutation,
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: QKNotifications.templates(),
          });
        },
      }
    );
  };
