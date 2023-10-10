import type { PropsWithChildren } from 'react';
import React from 'react';
import { useEscapeStack } from '@ff-client/contexts/escape/escape.context';
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
  useEscapeStack(closeModal);

  return <ModalWrapper style={style}>{children}</ModalWrapper>;
};
