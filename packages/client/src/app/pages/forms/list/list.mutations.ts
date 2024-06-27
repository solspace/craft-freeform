import { useSiteContext } from '@ff-client/contexts/site/site.context';
import { QKForms } from '@ff-client/queries/forms';
import type { UseMutationResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useArchiveFormMutation = (): UseMutationResult<
  unknown,
  Error,
  number,
  number
> => {
  const queryClient = useQueryClient();
  const { getCurrentHandleWithFallback } = useSiteContext();

  return useMutation((id) => axios.post(`/api/forms/${id}/archive`), {
    onMutate: (id) => id,
    onSuccess: () => {
      queryClient.invalidateQueries(
        QKForms.all(getCurrentHandleWithFallback())
      );
    },
  });
};

export const useCloneFormMutation = (): UseMutationResult<
  unknown,
  Error,
  number,
  number
> => {
  const queryClient = useQueryClient();
  const { getCurrentHandleWithFallback } = useSiteContext();

  return useMutation((id) => axios.post(`/api/forms/${id}/clone`), {
    onMutate: (id) => id,
    onSuccess: () => {
      queryClient.invalidateQueries(
        QKForms.all(getCurrentHandleWithFallback())
      );
    },
  });
};
