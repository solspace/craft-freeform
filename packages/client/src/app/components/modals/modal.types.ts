import type { PropsWithChildren } from 'react';
import type { GenericValue } from '@ff-client/types/properties';

export type ModalType = React.FC<ModalContainerProps>;

export type ModalContainerProps<T = GenericValue> = PropsWithChildren<{
  closeModal: () => void;
  data?: T;
}>;

export type ModalConfig = {
  allowEscape?: boolean;
  requireConfirmation?: boolean;
  confirmationMessage?: string;
};
