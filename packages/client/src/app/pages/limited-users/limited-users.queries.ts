import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { Item } from './limited-users.types';

const QKLimitedUsers = {
  all: ['limited-users'],
  one: (id: number) => [...QKLimitedUsers.all, id],
} as const;

export const useLimitedUsersQuery = (): UseQueryResult<Item[]> => {
  return useQuery<Item[]>(
    QKLimitedUsers.all,
    () => axios.get('/api/limited-users').then((res) => res.data),
    { staleTime: Infinity }
  );
};
