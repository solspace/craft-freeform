import type { FieldForm } from '@ff-client/types/fields';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const QKForms = {
  all: ['field-forms'] as const,
};

type FetchFormsQuery = () => UseQueryResult<FieldForm[], AxiosError>;

export const useFetchForms: FetchFormsQuery = () =>
  useQuery<FieldForm[], AxiosError>(
    QKForms.all,
    () => axios.get<FieldForm[]>(`/api/fields/forms`).then((res) => res.data),
    {
      staleTime: Infinity,
    }
  );
