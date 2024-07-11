import { downloadFile } from '@ff-client/utils/files';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
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

export const useFormsExportMutation = (): UseMutationResult<
  AxiosResponse<Blob>,
  unknown,
  ExportOptions,
  unknown
> => {
  return useMutation(
    (data) => axios.post('/export', data, { responseType: 'blob' }),
    {
      onSuccess: (data) => {
        // format current date to YYYYMMDD-HHMMSS
        const time = new Date()
          .toISOString()
          .replace(/[-:]/g, '')
          .replace('T', '-')
          .slice(0, -5);

        const name = `freeform-export-${time}.zip`;

        downloadFile(data.data, name);
      },
    }
  );
};
