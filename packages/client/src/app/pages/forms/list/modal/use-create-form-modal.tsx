import { useModal } from '@components/modals/modal.context';

import { CreateFormModal } from './create-form-modal';

type CreateFormModal = () => () => void;

export const useCreateFormModal: CreateFormModal = () => {
  const { openModal } = useModal();

  return (): void => {
    openModal(CreateFormModal);
  };
};
