import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { QKGroups } from "@ff-client/queries/form-groups";
import { QKForms } from "@ff-client/queries/forms";
import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useArchiveFormMutation = (): UseMutationResult<
  unknown,
  Error,
  number,
  number
> => {
  const queryClient = useQueryClient();
  const { getCurrentHandleWithFallback } = useSiteContext();

  return useMutation({
    mutationFn: (id) =>
      axios.post(`/api/forms/${id}/archive`, {
        site: getCurrentHandleWithFallback(),
      }),
    onMutate: (id) => id,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QKGroups.all(getCurrentHandleWithFallback()),
      });

      queryClient.invalidateQueries({
        queryKey: QKForms.all(getCurrentHandleWithFallback()),
      });
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

  return useMutation({
    mutationFn: (id) => axios.post(`/api/forms/${id}/clone`),
    onMutate: (id) => id,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QKGroups.all(getCurrentHandleWithFallback()),
      });

      queryClient.invalidateQueries({
        queryKey: QKForms.all(getCurrentHandleWithFallback()),
      });
    },
  });
};
