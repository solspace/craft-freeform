import { useModal } from "@components/modals/modal.context";
import translate from "@ff-client/utils/translations";

import { CreateModal } from "./modal";

export const useCreateModal = (): (() => void) => {
  const { openSlideout } = useModal();

  return (): void => {
    openSlideout(CreateModal, undefined, translate("Field Type Manager"));
  };
};
