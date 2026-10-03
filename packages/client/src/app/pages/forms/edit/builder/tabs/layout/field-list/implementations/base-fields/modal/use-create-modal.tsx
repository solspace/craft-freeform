import { useModal } from "@components/modals/modal.context";

import { CreateModal } from "./modal";

export const useCreateModal = (): (() => void) => {
  const { openSlideout } = useModal();

  return (): void => {
    openSlideout(CreateModal);
  };
};
