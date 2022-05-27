import { FieldType } from '@ff-client/types/fields';
import axios from 'axios';
import { useQuery, UseQueryResult } from 'react-query';

export const useFetchFieldTypes = (): UseQueryResult<FieldType[], Error> => {
  return useQuery<FieldType[], Error>(
    'field-types',
    () => axios.get<FieldType[]>(`/client/api/fields/types`).then((res) => res.data),
    { staleTime: Infinity }
  );
};
