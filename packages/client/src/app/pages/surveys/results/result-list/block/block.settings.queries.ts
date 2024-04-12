import type { APIError } from '@ff-client/types/api';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

import type { Chart } from '../../results.types';

type Variables = {
  fieldId: number;
  chartType: Chart;
};

type SettingsMutation = (variables: Variables) => Promise<AxiosResponse>;

const settingsMutation: SettingsMutation = ({ fieldId, chartType }) => {
  const payload = {
    fieldId,
    chartType,
  };

  return axios.post('/api/surveys/preferences', payload);
};

type SettingsMutationResult = UseMutationResult<
  AxiosResponse<void>,
  APIError,
  Variables
>;

export const useSettingsMutation = (): SettingsMutationResult => {
  return useMutation<AxiosResponse, APIError, Variables, unknown>(
    settingsMutation
  );
};
