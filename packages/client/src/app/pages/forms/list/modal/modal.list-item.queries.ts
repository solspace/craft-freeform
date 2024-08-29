import { QKGroups } from '@ff-client/queries/groups';
import type { APIError } from '@ff-client/types/api';
import type { FormGroup } from '@ff-client/types/form-groups';
import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

type FormGroupsMutationResult = UseMutationResult<
  AxiosResponse<FormGroup>,
  APIError,
  FormGroup
>;

export const useFormGroupsMutation = (
  options: UseMutationOptions<
    AxiosResponse<FormGroup>,
    APIError,
    FormGroup
  > = {}
): FormGroupsMutationResult => {
  const queryClient = useQueryClient();

  const originalOnSuccess = options?.onSuccess;
  options.onSuccess = (
    data: AxiosResponse<FormGroup>,
    variables: FormGroup,
    context: unknown
  ) => {
    originalOnSuccess && originalOnSuccess(data, variables, context);
    queryClient.invalidateQueries(QKGroups.all);
  };

  return useMutation<AxiosResponse, APIError, FormGroup>((data: FormGroup) => {
    return axios.post<FormGroup>('/api/groups', data);
  }, options);
};
