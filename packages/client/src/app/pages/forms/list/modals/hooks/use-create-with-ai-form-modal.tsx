import { useModal } from "@components/modals/modal.context";

import { CreateWithAiFormModal } from "../modal.form.create-with-ai";

export const useCreateWithAiFormModal = (): (() => void) => {
  const { openModal } = useModal();

  return (): void => {
    openModal(CreateWithAiFormModal);
  };
};
