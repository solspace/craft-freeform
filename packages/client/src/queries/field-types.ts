import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import type { FieldType } from '@ff-client/types/fields';
import type { Section } from '@ff-client/types/properties';
import type { AxiosError } from 'axios';
import axios from 'axios';

const QKFieldTypes = {
  all: ['field-types'] as const,
  propertySections: () => [...QKFieldTypes.all, 'property-sections'] as const,
};

type FetchFieldTypesQuery = (options?: {
  select?: (data: FieldType[]) => FieldType[];
}) => UseQueryResult<FieldType[], AxiosError>;

export const useFetchFieldTypes: FetchFieldTypesQuery = ({ select } = {}) =>
  useQuery<FieldType[], AxiosError>(
    QKFieldTypes.all,
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
  Section[],
  AxiosError
> =>
  useQuery<Section[], AxiosError>(
    QKFieldTypes.propertySections(),
    () =>
      axios
        .get<Section[]>(`/client/api/fields/types/sections`)
        .then((res) => res.data)
        .then((res) => res.sort((a, b) => a.order - b.order)),
    {
      staleTime: Infinity,
    }
  );

export const useFieldType = (typeClass?: string): FieldType | undefined => {
  const { data } = useFetchFieldTypes();

  if (!data) {
    return undefined;
  }

  return data.find((item) => item.typeClass === typeClass);
};
