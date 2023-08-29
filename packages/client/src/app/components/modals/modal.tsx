import type { PropsWithChildren } from 'react';
import React, { useState } from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import type { GenericValue } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import {
  ModalBody,
  ModalContainer,
  ModalFooter,
  ModalHeader,
  ModalWrapper,
} from './modal.styles';

type Props = {
  title?: string;
  closeModal: () => void;
  onSave?: () => boolean | Promise<boolean>;
  style?: GenericValue;
};

export const Modal: React.FC<PropsWithChildren<Props>> = ({
  title,
  children,
  closeModal,
  onSave,
  style,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (): Promise<void> => {
    if (typeof onSave !== 'function') {
      return;
    }

    setIsSaving(true);

    try {
      const successful = await onSave();
      if (successful) {
        closeModal();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  useOnKeypress({
    callback: (event: KeyboardEvent): void => {
      switch (event.key) {
        case 'Enter':
          handleSave();
          return;

        case 'Escape':
          closeModal();
          return;
      }
    },
  });

  return (
    <ModalWrapper style={style}>
      <ModalContainer>
        {!!title && (
          <ModalHeader>
            <h1>{title}</h1>
          </ModalHeader>
        )}

        <ModalBody>{children}</ModalBody>

        <ModalFooter>
          <button className="btn cancel" onClick={closeModal}>
            {translate('Close')}
          </button>
          {typeof onSave === 'function' && (
            <button className="btn submit" onClick={handleSave}>
              <LoadingText
                loadingText={translate('Saving')}
                loading={isSaving}
                spinner
              >
                {translate('Save')}
              </LoadingText>
            </button>
          )}
        </ModalFooter>
      </ModalContainer>
    </ModalWrapper>
  );
};
