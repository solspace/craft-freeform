import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import type { Notice } from "./notices.types";

export const QKNotices = {
  all: ["notices"],
} as const;

export type NoticesResponse = {
  notices: Notice[];
  errors: number;
  errorLog: "activity" | "classic" | null;
  activityRetentionDays: number | null;
  warningLogs: {
    log: "activity" | "error-log" | "integrations-log" | "email-log";
    count: number;
  }[];
};

export const useNoticesQuery = (): UseQueryResult<NoticesResponse> => {
  return useQuery({
    queryKey: QKNotices.all,
    queryFn: () =>
      axios.get<NoticesResponse>("/api/notices").then((res) => res.data),
  });
};

export const useNoticeDeleteMutation = (): UseMutationResult => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => axios.delete(`/api/notices/${id}`),
    onMutate: (id: number) => {
      queryClient.setQueryData<NoticesResponse>(QKNotices.all, (oldData) => {
        return {
          ...oldData,
          notices: oldData.notices.filter((notice) => notice.id !== id),
        };
      });
    },
  });
};
