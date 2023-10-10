import type { PropsWithChildren } from 'react';
import React from 'react';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import type { GenericValue } from '@ff-client/types/properties';

import { ModalWrapper } from './modal.styles';

type Props = {
  title?: string;
  labels?: {
    close?: string;
    save?: string;
  };
  footer?: boolean;
  closeModal: () => void;
  onSave?: () => boolean | Promise<boolean>;
  style?: GenericValue;
};

export const Modal: React.FC<PropsWithChildren<Props>> = ({
  children,
  closeModal,
  style,
}) => {
  useOnKeypress({
    callback: (event: KeyboardEvent): void => {
      switch (event.key) {
        case 'Escape':
          closeModal();
          return;
      }
    },
  });

  return <ModalWrapper style={style}>{children}</ModalWrapper>;
};
