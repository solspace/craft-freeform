import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

import type { FormImportData } from '../../../import/import.types';
import type { ExportOptions } from '../../export.types';

const QKExportForms = {
  data: ['export', 'freeform', 'data'],
} as const;

const queryFunction = (): Promise<FormImportData> =>
  axios.get<FormImportData>('/export/forms/data').then((res) => res.data);

export const useFormsDataQuery = (): UseQueryResult<FormImportData> => {
  return useQuery(QKExportForms.data, queryFunction);
};

type Response = AxiosResponse<{
  token: string;
}>;

export const useFormsExportMutation = (
  options?: UseMutationOptions<Response, unknown, ExportOptions, unknown>
): UseMutationResult<Response, unknown, ExportOptions, unknown> => {
  return useMutation((data) => axios.post('/export/forms/init', data), options);
};
