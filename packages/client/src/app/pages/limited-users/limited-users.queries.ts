import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

import type { DetailResponse, Item, ListResponse } from './limited-users.types';

const QKLimitedUsers = {
  all: ['limited-users'],
  one: (id: string | number) => [...QKLimitedUsers.all, id],
} as const;

export const useLimitedUsersQuery = (): UseQueryResult<ListResponse> => {
  return useQuery<ListResponse>(
    QKLimitedUsers.all,
    () => axios.get(`/api/limited-users`).then((res) => res.data),
    { staleTime: Infinity }
  );
};

export const useLimitedUsersSingleQuery = (
  id: string | number
): UseQueryResult<DetailResponse> => {
  return useQuery<DetailResponse>(
    QKLimitedUsers.one(id),
    () => axios.get(`/api/limited-users/${id}`).then((res) => res.data),
    { staleTime: Infinity }
  );
};

type Payload = {
  name: string;
  description: string;
  items: Item[];
};

export const useLimitedUsersMutation = (
  id: string | number
): UseMutationResult<AxiosResponse<{ id: string }>, unknown, Payload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Payload) => {
      return axios.post(`/api/limited-users/${id}`, {
        name: payload.name,
        description: payload.description,
        items: payload.items,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(QKLimitedUsers.all);
    },
  });
};

export const useLimitedUsersDeleteMutation = (): UseMutationResult => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => {
      return axios.delete(`/api/limited-users/${id}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(QKLimitedUsers.all);
    },
  });
};
