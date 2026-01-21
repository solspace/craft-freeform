import React, { useEffect, useState } from 'react';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import { Modal } from '@ff-client/app/components/modals/modal';
import { FormWrapper } from '@ff-client/app/pages/forms/edit/builder/tabs/form-monitor/form-monitor.action.modal.styles';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { sanitize } from 'dompurify';

type Props = {
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export const DisableMonitoringModal: React.FC<Props> = ({
  onClose,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = async (): Promise<void> => {
    if (!enabled) return;
    try {
      setIsLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setEnabled(inputValue.toUpperCase() === 'CONFIRM');
  }, [inputValue]);

  return (
    <Modal closeModal={onClose}>
      <ModalContainer>
        <ModalHeader>
          <h1>{translate('Disable Monitoring')}</h1>
        </ModalHeader>
        <FormWrapper>
          <div>
            {translate(
              'Are you sure you want to disable monitoring for this site?'
            )}
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: sanitize(
                translate(
                  'To disable monitoring, please type <strong>CONFIRM</strong> in the box below:'
                )
              ),
            }}
          />
          <input
            type="text"
            autoFocus={true}
            value={inputValue}
            autoComplete="off"
            onChange={(e) => setInputValue(e.target.value)}
            className="text fullwidth"
          />
        </FormWrapper>
        <ModalFooter>
          <button className="btn cancel" onClick={onClose} disabled={isLoading}>
            {translate('Cancel')}
          </button>
          <button
            className={classes('btn submit', !enabled && 'disabled')}
            onClick={handleConfirm}
            disabled={!enabled || isLoading}
          >
            {translate('Disable')}
          </button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};

export const DisableAndDeleteMonitoringModal: React.FC<Props> = ({
  onClose,
  onConfirm,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async (): Promise<void> => {
    if (!enabled) return;
    try {
      setIsLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setEnabled(inputValue.toUpperCase() === 'CONFIRM');
  }, [inputValue]);

  return (
    <Modal closeModal={onClose}>
      <ModalContainer>
        <ModalHeader>
          <h1>{translate('Disable & Delete Monitoring Data')}</h1>
        </ModalHeader>
        <FormWrapper>
          <div>
            {translate(
              'Are you sure you want to disable monitoring and delete all monitoring data for this site?'
            )}
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: sanitize(
                translate(
                  'To disable monitoring and delete all data, please type <strong>CONFIRM</strong> in the box below:'
                )
              ),
            }}
          />
          <input
            type="text"
            autoFocus={true}
            value={inputValue}
            autoComplete="off"
            onChange={(e) => setInputValue(e.target.value)}
            className="text fullwidth"
          />
        </FormWrapper>
        <ModalFooter>
          <button className="btn cancel" onClick={onClose} disabled={isLoading}>
            {translate('Cancel')}
          </button>
          <button
            className={classes('btn submit', !enabled && 'disabled')}
            onClick={handleConfirm}
            disabled={!enabled || isLoading}
          >
            {translate('Disable & Delete')}
          </button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};
