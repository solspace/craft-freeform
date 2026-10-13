import { useModal } from "@components/modals/modal.context";

import { EditGroupModal } from "../modal.group.edit";

type EditGroupModalType = () => () => void;

export const useEditGroupModal: EditGroupModalType = () => {
  const { openSlideout } = useModal();

  return (): void => {
    openSlideout(EditGroupModal);
  };
};
