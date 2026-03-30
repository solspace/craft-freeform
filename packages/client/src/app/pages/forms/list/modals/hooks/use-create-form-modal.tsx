import { useModal } from "@components/modals/modal.context";

import { CreateFormModal } from "../modal.form.create";

type CreateFormModalType = () => () => void;

export const useCreateFormModal: CreateFormModalType = () => {
  const { openModal } = useModal();

  return (): void => {
    openModal(CreateFormModal);
  };
};
