import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

export type FormMonitorEnableCallback = {
  onLoading?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
};

export const useFormMonitorEnableMutation = (
  formId: number,
  callbacks?: FormMonitorEnableCallback
): UseMutationResult<AxiosResponse, unknown, void, unknown> => {
  return useMutation({
    mutationFn: () => {
      return axios.put(`/api/form-monitor/forms/${formId}/enable`);
    },
    onMutate: () => {
      callbacks?.onLoading?.();
    },
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: () => {
      callbacks?.onError?.();
    },
  });
};
