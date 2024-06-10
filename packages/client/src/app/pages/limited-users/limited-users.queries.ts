import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { DetailResponse, Item } from './limited-users.types';

const QKLimitedUsers = {
  all: ['limited-users'],
  one: (id: number) => [...QKLimitedUsers.all, id],
} as const;

export const useLimitedUsersQuery = (
  id?: number
): UseQueryResult<DetailResponse> => {
  return useQuery<DetailResponse>(
    QKLimitedUsers.one(id),
    () =>
      axios
        .get(`/api/limited-users${id ? `/${id}` : ''}`)
        .then((res) => res.data),
    { staleTime: Infinity }
  );
};

type Payload = {
  name: string;
  items: Item[];
};

export const useLimitedUsersMutation = (
  id: number
): UseMutationResult<Payload, unknown, Payload> => {
  return useMutation({
    mutationFn: (payload: Payload) => {
      return axios.post(`/api/limited-users/${id}`, {
        name: payload.name,
        items: payload.items,
      });
    },
  });
};
