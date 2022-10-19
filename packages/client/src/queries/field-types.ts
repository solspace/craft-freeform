import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import type { FieldType, PropertySection } from '@ff-client/types/fields';
import type { AxiosError } from 'axios';
import axios from 'axios';

type FetchFieldTypesQuery = (options?: {
  select?: (data: FieldType[]) => FieldType[];
}) => UseQueryResult<FieldType[], AxiosError>;

export const useFetchFieldTypes: FetchFieldTypesQuery = ({ select } = {}) =>
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

export const useFetchFieldPropertySections = (): UseQueryResult<
  PropertySection[],
  AxiosError
> =>
  useQuery<PropertySection[], AxiosError>(
    ['field-types', 'property-sections'],
    () =>
      axios
        .get<PropertySection[]>(`/client/api/fields/types/sections`)
        .then((res) => res.data)
        .then((res) => res.sort((a, b) => a.order - b.order)),
    {
      staleTime: Infinity,
    }
  );

export const useFieldType = (typeClass?: string): FieldType | undefined => {
  const { data } = useFetchFieldTypes();

  return data.find((item) => item.typeClass === typeClass);
};
