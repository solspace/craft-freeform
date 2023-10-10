import type { PropsWithChildren } from 'react';

export type ModalType = React.FC<ModalContainerProps>;

export type ModalContainerProps = PropsWithChildren<{
  closeModal: () => void;
}>;
