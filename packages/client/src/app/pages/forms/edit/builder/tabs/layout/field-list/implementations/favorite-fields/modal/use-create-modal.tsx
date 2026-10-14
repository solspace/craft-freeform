import { useModal } from "@components/modals/modal.context";
import translate from "@ff-client/utils/translations";

import { FavoriteFieldsManagerModal } from "./modal";

export const useFavoriteFieldsManagerModal = (): (() => void) => {
  const { openSlideout } = useModal();

  return (): void => {
    openSlideout(
      FavoriteFieldsManagerModal,
      undefined,
      translate("Favorite Fields"),
    );
  };
};
