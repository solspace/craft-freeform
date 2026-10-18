import { useEscapeStack } from "@ff-client/contexts/escape/escape.context";
import type { GenericValue } from "@ff-client/types/properties";
import type React from "react";
import type { PropsWithChildren } from "react";
import { useState } from "react";

import { ModalWrapper } from "./modal.styles";
import type { ModalConfig } from "./modal.types";

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
  config?: ModalConfig;
};

export const Modal: React.FC<PropsWithChildren<Props>> = ({
  children,
  closeModal,
  style,
  config,
}) => {
  // Keep the entrance style for the leave transition after the config is removed.
  const [animation] = useState(config?.animation);
  useEscapeStack(closeModal, config?.allowEscape ?? true);

  return (
    <ModalWrapper
      style={animation === "fade" ? { opacity: style?.opacity } : style}
    >
      {children}
    </ModalWrapper>
  );
};
