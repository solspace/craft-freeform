import { NativeSlideout } from "@components/slideouts/slideout";
import type { GenericValue } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import cloneDeep from "lodash/cloneDeep";
import type React from "react";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ConfirmationDialog } from "./confirmation/confirmation";
import type { ConfirmationOptions } from "./confirmation/confirmation.types";

import { Modal } from "./modal";
import { useAnimateModals, useAnimateOverlay } from "./modal.animations";
import { ModalHub, ModalOverlay } from "./modal.styles";
import type { ModalConfig, ModalType } from "./modal.types";

type ContextType = {
  hasOpenModals: boolean;
  openModal: (
    modal: ModalType,
    modalData?: GenericValue,
    modalConfig?: ModalConfig,
  ) => void;
  openSlideout: (content: ModalType, data?: GenericValue) => void;
  confirm: (options: ConfirmationOptions) => void;
  confirmDelete: (options: ConfirmationOptions) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ContextType>({
  hasOpenModals: false,
  openModal: () => void {},
  openSlideout: () => void {},
  confirm: () => void {},
  confirmDelete: () => void {},
  closeModal: () => void {},
});

export const useModal = (): ContextType => useContext(ModalContext);

export const ModalProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [confirmation, setConfirmation] = useState<ConfirmationOptions>();
  const confirmDelete = (options: ConfirmationOptions): void => {
    setConfirmation(options);
  };

  const [slideout, setSlideout] = useState<{
    content: ModalType;
    data?: GenericValue;
  }>();
  const openSlideout = (content: ModalType, data?: GenericValue): void => {
    setSlideout({ content, data });
  };

  const [data, setData] = useState<GenericValue[]>([]);
  const [modals, setModals] = useState<ModalType[]>([]);
  const [configs, setConfigs] = useState<ModalConfig[]>([]);

  const openModal = (
    modal: ModalType,
    modalData?: GenericValue,
    config?: ModalConfig,
  ): void => {
    setData([...data, modalData]);
    setModals([...modals, modal]);
    setConfigs([...configs, config]);
  };

  const closeModal = (): void => {
    setData(data.slice(0, -1));
    setModals(modals.slice(0, -1));
    setConfigs(configs.slice(0, -1));
  };

  useEffect(() => {
    if (!modals.length) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modals]);

  const overlayAnimation = useAnimateOverlay(modals.length > 0);
  const transitions = useAnimateModals(modals);

  return (
    <ModalContext.Provider
      value={{
        openModal,
        openSlideout,
        closeModal,
        confirm: confirmDelete,
        confirmDelete,
        hasOpenModals: modals.length > 0 || !!slideout || !!confirmation,
      }}
    >
      {children}
      {createPortal(
        <ModalHub>
          <ModalOverlay
            style={overlayAnimation}
            className={classes(!modals.length && "inactive")}
          >
            {transitions((style, ModalContent, _, index) => (
              <Modal
                key={index}
                closeModal={closeModal}
                style={style}
                config={cloneDeep(configs[index])}
              >
                <ModalContent
                  closeModal={closeModal}
                  data={cloneDeep(data[index])}
                />
              </Modal>
            ))}
          </ModalOverlay>
        </ModalHub>,
        document.body,
      )}
      {slideout && (
        <NativeSlideout
          content={slideout.content}
          data={slideout.data}
          onClose={() => setSlideout(undefined)}
        />
      )}
      {confirmation && (
        <ConfirmationDialog
          {...confirmation}
          onClose={() => setConfirmation(undefined)}
        />
      )}
    </ModalContext.Provider>
  );
};
