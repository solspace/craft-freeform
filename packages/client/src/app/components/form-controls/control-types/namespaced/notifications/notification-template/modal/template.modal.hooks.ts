import { useModal } from '@components/modals/modal.context';

import { EditNotificationModal } from './template.modal';

type Modal = () => (id: string | number) => void;

export const useNotificationEditModal: Modal = () => {
  const { openModal } = useModal();

  return (id): void => {
    openModal(
      EditNotificationModal,
      { id },
      {
        allowEscape: false,
        requireConfirmation: true,
        confirmationMessage:
          'Are you sure you want to close? Any unsaved changes will be lost.',
      }
    );
  };
};
