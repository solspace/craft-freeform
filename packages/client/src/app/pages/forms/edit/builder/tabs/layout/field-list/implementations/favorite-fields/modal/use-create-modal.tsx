import { useModal } from "@components/modals/modal.context";

import { FavoriteFieldsManagerModal } from "./modal";

export const useFavoriteFieldsManagerModal = (): (() => void) => {
  const { openModal } = useModal();

  return (): void => {
    openModal(FavoriteFieldsManagerModal);
  };
};
