import config from '@config/freeform/freeform.config';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import type { Notice } from './notices.types';

export const QKNotices = {
  all: ['notices'],
} as const;

type NoticesResponse = {
  notices: Notice[];
  errors: number;
};

export const useNoticesQuery = (): UseQueryResult<NoticesResponse> => {
  return useQuery(
    QKNotices.all,
    () => axios.get<NoticesResponse>('/api/notices').then((res) => res.data),
    { enabled: config.feed }
  );
};

export const useNoticeDeleteMutation = (): UseMutationResult => {
  const queryClient = useQueryClient();

  return useMutation((id: number) => axios.delete(`/api/notices/${id}`), {
    onMutate: (id: number) => {
      queryClient.setQueryData<Notice[]>(QKNotices.all, (oldData) => {
        return oldData.filter((notice) => notice.id !== id);
      });
    },
  });
};
