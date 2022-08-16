import axios, { AxiosError } from 'axios';
import { useCallback } from 'react';
import { useQuery, UseQueryResult } from 'react-query';
import { useSelector } from 'react-redux';

import {
  Search,
  selectQuery,
} from '@ff-client/app/pages/forms/edit/store/slices/search';

import type { FieldType } from '@ff-client/types/fields';
export const useFetchFieldTypes = (): UseQueryResult<
  FieldType[],
  AxiosError
> => {
  const searchQuery = useSelector(selectQuery(Search.Fields));

  const select = useCallback(
    (data: FieldType[]) => {
      if (!searchQuery) {
        return data;
      }

      return data.filter((item) =>
        item.name.toLowerCase().includes(searchQuery)
      );
    },
    [searchQuery]
  );

  return useQuery<FieldType[], AxiosError>(
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
};
