import type { FieldType } from '@ff-client/types/fields';
import type { Section } from '@ff-client/types/properties';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const QKFieldTypes = {
  all: ['field-types'] as const,
  propertySections: () => [...QKFieldTypes.all, 'property-sections'] as const,
};

type FetchFieldTypesQuery = (options?: {
  select?: (data: FieldType[]) => FieldType[];
}) => UseQueryResult<FieldType[], AxiosError>;

export const fetchFieldTypes = (): Promise<FieldType[]> =>
  axios.get<FieldType[]>(`/api/fields/types`).then((res) => res.data);

export const useFetchFieldTypes: FetchFieldTypesQuery = ({ select } = {}) =>
  useQuery<FieldType[], AxiosError>(QKFieldTypes.all, fetchFieldTypes, {
    staleTime: Infinity,
    select,
  });

export const fetchFieldPropertySections = (): Promise<Section[]> =>
  axios
    .get<Section[]>(`/api/fields/types/sections`)
    .then((res) => res.data)
    .then((res) => res.sort((a, b) => a.order - b.order));

export const useFetchFieldPropertySections = (): UseQueryResult<
  Section[],
  AxiosError
> =>
  useQuery<Section[], AxiosError>(
    QKFieldTypes.propertySections(),
    fetchFieldPropertySections,
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

type FieldTypeSearch = () => (typeClass: string) => FieldType | undefined;

export const useFieldTypeSearch: FieldTypeSearch = () => {
  const { data } = useFetchFieldTypes();

  return (typeClass: string): FieldType | undefined => {
    if (!data) {
      return undefined;
    }

    return data.find((item) => item.typeClass === typeClass);
  };
};
