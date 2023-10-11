import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import classes from '@ff-client/utils/classes';

import { Modal } from './modal';
import { useAnimateModals, useAnimateOverlay } from './modal.animations';
import { ModalHub, ModalOverlay } from './modal.styles';
import type { ModalType } from './modal.types';

type ContextType = {
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ContextType>({
  openModal: () => void {},
  closeModal: () => void {},
});

export const useModal = (): ContextType => useContext(ModalContext);

export const ModalProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [modals, setModals] = useState<ModalType[]>([]);

  const openModal = (modal: ModalType): void => {
    setModals([...modals, modal]);
  };

  const closeModal = (): void => {
    setModals(modals.slice(0, -1));
  };

  useEffect(() => {
    if (modals.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [modals]);

  const overlayAnimation = useAnimateOverlay(modals.length > 0);
  const transitions = useAnimateModals(modals);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {createPortal(
        <ModalHub>
          <ModalOverlay
            style={overlayAnimation}
            className={classes(!modals.length && 'inactive')}
          >
            {transitions((style, ModalContent, _, index) => (
              <Modal key={index} closeModal={closeModal} style={style}>
                <ModalContent closeModal={closeModal} />
              </Modal>
            ))}
          </ModalOverlay>
        </ModalHub>,
        document.body
      )}
      {}
    </ModalContext.Provider>
  );
};
