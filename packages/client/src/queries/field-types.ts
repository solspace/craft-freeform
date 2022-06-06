import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';

import { FieldType } from '@ff-client/types/fields';

export const useFetchFieldTypes = (): UseQueryResult<FieldType[], AxiosError> => {
  return useQuery<FieldType[], AxiosError>(
    'field-types',
    () => axios.get<FieldType[]>(`/client/api/fields/types`).then((res) => res.data),
    { staleTime: Infinity }
  );
};
