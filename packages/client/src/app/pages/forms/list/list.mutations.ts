import { useSiteContext } from '@ff-client/contexts/site/site.context';
import { QKGroups } from '@ff-client/queries/form-groups';
import { QKForms } from '@ff-client/queries/forms';
import type { UseMutationResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useDeleteFormGroupsMutation = (
  isDeleteFromAllSites: boolean = false
): UseMutationResult<unknown, Error, number, number> => {
  const queryClient = useQueryClient();
  const { getCurrentHandleWithFallback } = useSiteContext();

  return useMutation(
    (id) =>
      axios.post(`/api/groups/delete`, {
        id,
        site: getCurrentHandleWithFallback(),
        isDeleteFromAllSites: isDeleteFromAllSites,
      }),
    {
      onMutate: (id) => id,
      onSuccess: () => {
        queryClient.invalidateQueries(
          QKGroups.all(getCurrentHandleWithFallback())
        );
      },
    }
  );
};

export const useArchiveFormMutation = (
  isProEdition: boolean = false
): UseMutationResult<unknown, Error, number, number> => {
  const queryClient = useQueryClient();
  const { getCurrentHandleWithFallback } = useSiteContext();
  const deleteFormGroupsMutation = useDeleteFormGroupsMutation();

  return useMutation((id) => axios.post(`/api/forms/${id}/archive`), {
    onMutate: (id) => id,
    onSuccess: (_data, id) => {
      if (isProEdition) {
        deleteFormGroupsMutation.mutate(id);
      } else {
        queryClient.invalidateQueries(
          QKForms.all(getCurrentHandleWithFallback())
        );
      }
    },
  });
};

export const useCloneFormMutation = (
  isProEdition: boolean = false
): UseMutationResult<unknown, Error, number, number> => {
  const queryClient = useQueryClient();
  const { getCurrentHandleWithFallback } = useSiteContext();

  return useMutation((id) => axios.post(`/api/forms/${id}/clone`), {
    onMutate: (id) => id,
    onSuccess: () => {
      queryClient.invalidateQueries(
        isProEdition
          ? QKGroups.all(getCurrentHandleWithFallback())
          : QKForms.all(getCurrentHandleWithFallback())
      );
    },
  });
};
