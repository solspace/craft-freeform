import { useSiteContext } from '@ff-client/contexts/site/site.context';
import type { FormWithGroup } from '@ff-client/types/form-groups';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const QKGroups = {
  base: ['groups'] as const,
  all: (site: string) => [...QKGroups.base, site] as const,
};

type FetchFormGroupsQuery = (options?: {
  select?: (data: FormWithGroup) => FormWithGroup;
}) => UseQueryResult<FormWithGroup, AxiosError>;

export const useFetchFormGroups: FetchFormGroupsQuery = () => {
  const { current, getCurrentHandleWithFallback } = useSiteContext();

  return useQuery<FormWithGroup, AxiosError>(
    QKGroups.all(getCurrentHandleWithFallback()),
    () =>
      axios
        .get<FormWithGroup>(`/api/groups`, {
          params: { site: current?.handle },
        })
        .then((res) => res.data)
  );
};
