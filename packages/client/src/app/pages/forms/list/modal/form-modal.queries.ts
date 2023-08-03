import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { Property } from '@ff-client/types/properties';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

import { modalActions } from '../store/slices/modal';

const QKFormModal = {
  all: ['form', 'modal'] as const,
};

type FetchFormModalQuery = () => UseQueryResult<Property[], AxiosError>;

export const useFetchFormModalType: FetchFormModalQuery = () => {
  const dispatch = useDispatch();

  const query = useQuery<Property[], AxiosError>(
    QKFormModal.all,
    () => axios.get<Property[]>(`/api/forms/modal`).then((res) => res.data),
    { staleTime: Infinity }
  );

  useEffect(() => {
    const values = query.data?.reduce(
      (combined, current) => ({ ...combined, [current.handle]: current.value }),
      {}
    );

    dispatch(modalActions.setInitialValues(values));
  }, [query.data]);

  return query;
};
