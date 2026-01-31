import React from 'react';
import { Modal } from '@components/modals/modal';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import type { ModalContainerProps } from '@components/modals/modal.types';
import translate from '@ff-client/utils/translations';

type ConfirmSubmissionsModalData = {
  url: string;
};

export const ConfirmSubmissionsModal: React.FC<
  ModalContainerProps<ConfirmSubmissionsModalData>
> = ({ closeModal, data }) => {
  const onContinue = (): void => {
    closeModal();
    window.location.href = data?.url;
  };

  return (
    <Modal closeModal={closeModal}>
      <ModalContainer>
        <ModalHeader>
          <h1>{translate('Leave the form builder?')}</h1>
        </ModalHeader>

        <div style={{ padding: 20 }}>
          {translate(
            'You are about to leave the form builder. Any unsaved changes may be lost if you continue.'
          )}
        </div>

        <ModalFooter>
          <button className="btn cancel" onClick={closeModal}>
            {translate('Cancel')}
          </button>
          <button className="btn submit" onClick={onContinue}>
            {translate('Continue')}
          </button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};
