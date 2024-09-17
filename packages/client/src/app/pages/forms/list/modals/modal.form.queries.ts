import type { Property } from '@ff-client/types/properties';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

const QKFormModal = {
  all: ['form', 'modal'] as const,
};

type FetchFormModalQuery = () => UseQueryResult<Property[], AxiosError>;

export const useFetchFormModalType: FetchFormModalQuery = () => {
  return useQuery<Property[], AxiosError>(
    QKFormModal.all,
    () => axios.get<Property[]>(`/api/forms/modal`).then((res) => res.data),
    { staleTime: Infinity }
  );
};
