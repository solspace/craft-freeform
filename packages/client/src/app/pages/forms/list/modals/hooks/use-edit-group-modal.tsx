import { useModal } from '@components/modals/modal.context';

import { EditGroupModal } from '../modal.group.edit';

type EditGroupModal = () => () => void;

export const useEditGroupModal: EditGroupModal = () => {
  const { openModal } = useModal();

  return (): void => {
    openModal(EditGroupModal);
  };
};
