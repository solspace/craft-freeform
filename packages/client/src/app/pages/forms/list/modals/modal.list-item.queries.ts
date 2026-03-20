import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { QKGroups } from "@ff-client/queries/form-groups";
import type { APIError } from "@ff-client/types/api";
import type { UpdateFormGroup } from "@ff-client/types/form-groups";
import type {
  MutationFunctionContext,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type FormGroupsMutationResult = UseMutationResult<
  unknown,
  APIError,
  UpdateFormGroup
>;

export const useFormGroupsMutation = (
  options: UseMutationOptions<unknown, APIError, UpdateFormGroup> = {},
): FormGroupsMutationResult => {
  const queryClient = useQueryClient();
  const { getCurrentHandleWithFallback } = useSiteContext();

  const originalOnSuccess = options?.onSuccess;
  options.onSuccess = (
    data: unknown,
    variables: UpdateFormGroup,
    onMutateResult: unknown,
    context: MutationFunctionContext,
  ) => {
    originalOnSuccess?.(data, variables, onMutateResult, context);
    queryClient.invalidateQueries({
      queryKey: QKGroups.all(getCurrentHandleWithFallback()),
    });
  };

  return useMutation<unknown, APIError, UpdateFormGroup>({
    ...options,
    mutationFn: async (data: UpdateFormGroup) => {
      const { orderedFormIds, ...formGroupsData } = data;

      await axios.post("/api/forms/groups", formGroupsData);

      if (orderedFormIds && orderedFormIds.length > 0) {
        await axios.post("/api/forms/sort", {
          orderedFormIds: orderedFormIds,
        });
      }
    },
  });
};
