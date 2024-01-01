import { useModal } from '@components/modals/modal.context';

import { CreateModal } from './modal';

export const useCreateModal = (): (() => void) => {
  const { openModal } = useModal();

  return (): void => {
    openModal(CreateModal);
  };
};
