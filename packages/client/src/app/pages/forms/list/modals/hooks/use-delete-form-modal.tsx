import { useModal } from "@components/modals/modal.context";
import type { FormWithStats } from "@ff-client/types/forms";

import { DeleteFormModal } from "../modal.form.delete";

type ModalData = {
  form: FormWithStats;
};

type DeleteFormModalType = (data: ModalData) => () => void;

export const useDeleteFormModal: DeleteFormModalType = (data) => {
  const { openModal } = useModal();

  return (): void => {
    openModal(DeleteFormModal, data);
  };
};
