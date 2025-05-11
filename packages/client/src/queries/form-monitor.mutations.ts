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

export type DeleteTestCallback = {
  onSuccess?: () => void;
  onError?: () => void;
};

export const useDeleteTestMutation = (
  formId: number,
  testId: number,
  callbacks?: DeleteTestCallback
): UseMutationResult<AxiosResponse, unknown, void, unknown> => {
  return useMutation({
    mutationFn: () => {
      return axios.delete(`/api/form-monitor/forms/${formId}/tests/${testId}`);
    },
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: () => {
      callbacks?.onError?.();
    },
  });
};

export type ClearAllTestsCallback = {
  onSuccess?: () => void;
  onError?: () => void;
};

export const useClearAllTestHistoryMutation = (
  formId: number,
  callbacks?: ClearAllTestsCallback
): UseMutationResult<AxiosResponse, unknown, void, unknown> => {
  return useMutation({
    mutationFn: () => {
      return axios.delete(`/api/form-monitor/forms/${formId}/tests/all`);
    },
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: () => {
      callbacks?.onError?.();
    },
  });
};

export type DisableMonitoringCallback = {
  onSuccess?: () => void;
  onError?: () => void;
};

export const useDisableMonitoringMutation = (
  formId: number,
  callbacks?: DisableMonitoringCallback
): UseMutationResult<AxiosResponse, unknown, void, unknown> => {
  return useMutation({
    mutationFn: () => {
      return axios.put(`/api/form-monitor/forms/${formId}/disable`);
    },
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: () => {
      callbacks?.onError?.();
    },
  });
};

export type DisableAndClearMonitoringCallback = {
  onSuccess?: () => void;
  onError?: () => void;
};

export const useDisableAndClearMonitoringMutation = (
  formId: number,
  callbacks?: DisableAndClearMonitoringCallback
): UseMutationResult<AxiosResponse, unknown, void, unknown> => {
  return useMutation({
    mutationFn: () => {
      return axios.put(`/api/form-monitor/forms/${formId}/disable-and-clear`);
    },
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: () => {
      callbacks?.onError?.();
    },
  });
};
