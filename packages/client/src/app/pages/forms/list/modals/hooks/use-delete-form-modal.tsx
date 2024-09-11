import { useModal } from '@components/modals/modal.context';
import type { FormWithStats } from '@ff-client/types/forms';

import { DeleteFormModal } from '../modal.form.delete';

type ModalData = {
  form: FormWithStats;
};

type DeleteFormModal = (data: ModalData) => () => void;

export const useDeleteFormModal: DeleteFormModal = (data) => {
  const { openModal } = useModal();

  return (): void => {
    openModal(DeleteFormModal, data);
  };
};
