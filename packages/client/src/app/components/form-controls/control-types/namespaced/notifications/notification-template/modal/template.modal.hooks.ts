import { useModal } from '@components/modals/modal.context';

import { EditNotificationModal } from './template.modal';

type Options = {
  id?: string | number;
  type?: string;
};

type Modal = () => (options?: Options) => void;

export const useNotificationEditModal: Modal = () => {
  const { openModal } = useModal();

  return (options = {}): void => {
    openModal(
      EditNotificationModal,
      { ...options },
      {
        allowEscape: false,
        requireConfirmation: true,
        confirmationMessage:
          'Are you sure you want to close? Any unsaved changes will be lost.',
      }
    );
  };
};
