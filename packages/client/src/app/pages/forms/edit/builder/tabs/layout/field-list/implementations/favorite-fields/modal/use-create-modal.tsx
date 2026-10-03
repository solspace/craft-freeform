import { useModal } from "@components/modals/modal.context";

import { FavoriteFieldsManagerModal } from "./modal";

export const useFavoriteFieldsManagerModal = (): (() => void) => {
  const { openSlideout } = useModal();

  return (): void => {
    openSlideout(FavoriteFieldsManagerModal);
  };
};
