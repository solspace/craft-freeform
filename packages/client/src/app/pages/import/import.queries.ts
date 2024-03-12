import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { FormImportData } from './import.types';

const QKImport = {
  data: (url: string) => ['import', 'data', url],
} as const;

const queryFunction = (url: string) => (): Promise<FormImportData> =>
  axios.get<FormImportData>(url).then((res) => res.data);

export const useImportPreviewQuery = (
  url: string
): UseQueryResult<FormImportData> => {
  return useQuery(QKImport.data(url), queryFunction(url));
};
