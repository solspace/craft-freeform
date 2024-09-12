import { useModal } from '@components/modals/modal.context';

import { CreateFormModal } from '../modal.form.create';

type CreateFormModal = () => () => void;

export const useCreateFormModal: CreateFormModal = () => {
  const { openModal } = useModal();

  return (): void => {
    console.log(openModal);
    openModal(CreateFormModal);
  };
};
