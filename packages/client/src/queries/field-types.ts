import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';

import type { FieldType } from '@ff-client/types/fields';

type FetchFieldTypesQuery = (options?: {
  select?: (data: FieldType[]) => FieldType[];
}) => UseQueryResult<FieldType[], AxiosError>;

export const useFetchFieldTypes: FetchFieldTypesQuery = ({ select }) =>
  useQuery<FieldType[], AxiosError>(
    'field-types',
    () =>
      axios
        .get<FieldType[]>(`/client/api/fields/types`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      select,
    }
  );
