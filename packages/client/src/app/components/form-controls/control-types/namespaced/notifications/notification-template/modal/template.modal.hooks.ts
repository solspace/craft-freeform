import { useModal } from '@components/modals/modal.context';

import { EditNotificationModal } from './template.modal';

export type NotificationEditModalOptions = {
  id?: string | number;
  type?: string;
  onSuccess?: (id: string | number) => void;
};

type Modal = () => (options?: NotificationEditModalOptions) => void;

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
