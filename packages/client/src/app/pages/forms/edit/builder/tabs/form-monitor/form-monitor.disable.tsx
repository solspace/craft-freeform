import React, { useEffect, useState } from 'react';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import { Modal } from '@ff-client/app/components/modals/modal';
import {
  useDisableAndClearMonitoringMutation,
  useDisableMonitoringMutation,
} from '@ff-client/queries/form-monitor.mutations';
import translate from '@ff-client/utils/translations';

import { FormWrapper } from './form-monitor.action.modal.styles';

interface ModalProps {
  formId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const DisableMonitoringModal: React.FC<ModalProps> = ({
  formId,
  onClose,
  onSuccess,
}) => {
  const disableMonitoringMutation = useDisableMonitoringMutation(formId, {
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const handleDisable = (): void => {
    disableMonitoringMutation.mutate();
  };

  return (
    <Modal closeModal={onClose}>
      <ModalContainer>
        <ModalHeader>
          <h1>{translate('Disable Monitoring')}</h1>
        </ModalHeader>
        <FormWrapper>
          <div>
            {translate(
              'Are you sure you want to disable monitoring for this form?'
            )}
          </div>
        </FormWrapper>
        <ModalFooter>
          <button className="btn cancel" onClick={onClose}>
            {translate('Cancel')}
          </button>
          <button
            className="btn submit"
            onClick={handleDisable}
            disabled={disableMonitoringMutation.isLoading}
          >
            {translate('Disable')}
          </button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};

export const DisableAndDeleteMonitoringModal: React.FC<ModalProps> = ({
  formId,
  onClose,
  onSuccess,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const disableAndClearMonitoringMutation =
    useDisableAndClearMonitoringMutation(formId, {
      onSuccess: () => {
        onSuccess();
        onClose();
      },
    });

  const handleDisableAndDelete = (): void => {
    if (!enabled) return;
    disableAndClearMonitoringMutation.mutate();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value);
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
              'Are you sure you want to disable monitoring and delete all monitoring data for this form?'
            )}
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: translate(
                'To disable monitoring and delete all data, please type <strong>CONFIRM</strong> in the box below:'
              ),
            }}
          />
          <input
            type="text"
            autoFocus={true}
            value={inputValue}
            autoComplete="off"
            onChange={handleChange}
            className="text fullwidth"
          />
        </FormWrapper>
        <ModalFooter>
          <button className="btn cancel" onClick={onClose}>
            {translate('Cancel')}
          </button>
          <button
            className={`btn submit ${!enabled ? 'disabled' : ''}`}
            onClick={handleDisableAndDelete}
            disabled={disableAndClearMonitoringMutation.isLoading || !enabled}
          >
            {translate('Disable & Delete')}
          </button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};
