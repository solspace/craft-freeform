import type { Group } from '@ff-client/types/groups';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const QKGroups = {
  all: ['groups'] as const,
};

type FetchGroupsQuery = (options?: {
  select?: (data: Group) => Group;
}) => UseQueryResult<Group, AxiosError>;

export const useFetchGroups: FetchGroupsQuery = ({ select } = {}) =>
  useQuery<Group, AxiosError>(
    QKGroups.all,
    () => axios.get<Group>(`/api/fields/types/groups`).then((res) => res.data),
    {
      staleTime: Infinity,
      select,
    }
  );
