import { useNavigate } from 'react-router-dom';
import type { APIError } from '@ff-client/types/api';
import { notifications } from '@ff-client/utils/notifications';
import translate from '@ff-client/utils/translations';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import type { ABTest } from '../ab-tests.types';

export const useAbTest = (id: string): UseQueryResult<ABTest> => {
  return useQuery({
    queryKey: ['ab-tests', id],
    queryFn: () =>
      axios.get<ABTest>(`/api/ab-tests/${id}`).then((res) => res.data),
    gcTime: Infinity,
    staleTime: Infinity,
    enabled: Number.isInteger(Number(id)),
  });
};

export const useAbTestMutation = (
  id?: string,
  onError?: (error: APIError) => void
): UseMutationResult => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: ABTest) => {
      const payload = { ...values };

      if (!Number.isInteger(Number(id))) {
        return axios
          .post(`/api/ab-tests`, payload)
          .then((response) => response.data);
      }

      return axios
        .post(`/api/ab-tests/${id}`, payload)
        .then((response) => response.data);
    },
    onSuccess: (response) => {
      const { id } = response;

      notifications.success(translate('A/B Test Group saved successfully'));
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });

      if (id) {
        navigate(`/ab-tests/${id}`);
      }
    },
    onError,
  });
};
