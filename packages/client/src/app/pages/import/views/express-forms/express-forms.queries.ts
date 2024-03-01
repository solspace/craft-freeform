import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { FormImportData } from '../../import.types';

const QKExpressForms = {
  data: ['expressForms', 'data'],
} as const;

const queryFunction = (): Promise<FormImportData> =>
  axios
    .get<FormImportData>('/import/express-forms/data')
    .then((res) => res.data);

export const useExpressFormsDataQuery = (): UseQueryResult<FormImportData> => {
  return useQuery(QKExpressForms.data, queryFunction);
};
