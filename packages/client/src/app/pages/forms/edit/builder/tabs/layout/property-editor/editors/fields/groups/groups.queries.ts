import { QKGroups } from '@ff-client/queries/groups';
import type { APIError } from '@ff-client/types/api';
import type { GroupItem } from '@ff-client/types/groups';
import type {
  MutationFunctionContext,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

type GroupMutationResult = UseMutationResult<
  AxiosResponse<GroupItem>,
  APIError,
  GroupItem
>;

export const useGroupMutation = (
  options: UseMutationOptions<
    AxiosResponse<GroupItem>,
    APIError,
    GroupItem
  > = {}
): GroupMutationResult => {
  const queryClient = useQueryClient();

  const originalOnSuccess = options?.onSuccess;
  options.onSuccess = (
    data: AxiosResponse<GroupItem>,
    variables: GroupItem,
    onMutateResult: unknown,
    context: MutationFunctionContext
  ) => {
    originalOnSuccess?.(data, variables, onMutateResult, context);
    queryClient.invalidateQueries({ queryKey: QKGroups.all });
  };

  return useMutation<AxiosResponse, APIError, GroupItem>({
    ...options,
    mutationFn: (data: GroupItem) => {
      return axios.post<GroupItem>('/api/fields/types/groups', data);
    },
  });
};
