import { QKForms } from '@ff-client/queries/forms';
import type { Form } from '@ff-client/types/forms';
import type { UseMutationResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useDeleteFormMutation = (): UseMutationResult<
  unknown,
  Error,
  number,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation((id) => axios.delete(`/api/forms/${id}`), {
    onMutate: (id) => {
      return id;
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(QKForms.all, (old: Form[]) =>
        old.filter((form) => form.id !== id)
      );
    },
  });
};
