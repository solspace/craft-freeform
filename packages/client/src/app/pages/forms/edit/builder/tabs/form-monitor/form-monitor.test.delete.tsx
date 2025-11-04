import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import { Modal } from '@ff-client/app/components/modals/modal';
import {
  useClearAllTestHistoryMutation,
  useDeleteTestMutation,
} from '@ff-client/queries/form-monitor.mutations';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { FormWrapper } from './form-monitor.action.modal.styles';

type Props = {
  formId: number;
  testId: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export const DeleteTestModal: React.FC<Props> = ({
  formId,
  testId,
  onClose,
  onSuccess,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const isBulkDelete = testId === 0;

  const deleteTestMutation = useDeleteTestMutation(formId, testId, {
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const clearAllTestsMutation = useClearAllTestHistoryMutation(formId, {
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value);
  };

  const handleDelete = (): void => {
    if (isBulkDelete && !enabled) {
      return;
    }

    if (isBulkDelete) {
      clearAllTestsMutation.mutate();
    } else {
      deleteTestMutation.mutate();
    }
  };

  useEffect(() => {
    if (isBulkDelete) {
      setEnabled(inputValue.toUpperCase() === 'DELETE');
    } else {
      setEnabled(true);
    }
  }, [inputValue, isBulkDelete]);

  const isLoading =
    deleteTestMutation.isPending || clearAllTestsMutation.isPending;

  return (
    <Modal closeModal={onClose}>
      <ModalContainer>
        <ModalHeader>
          <h1>
            {translate(isBulkDelete ? 'Clear All Test History' : 'Delete Test')}
          </h1>
        </ModalHeader>

        <FormWrapper>
          <div>
            {translate(
              isBulkDelete
                ? 'Are you sure you want to clear all test history? This action cannot be undone.'
                : 'Are you sure you want to permanently delete this test? This action cannot be undone.'
            )}
          </div>
          {isBulkDelete && (
            <>
              <div
                dangerouslySetInnerHTML={{
                  __html: translate(
                    'To clear all test history, please type <strong>DELETE</strong> in the box below:'
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
            </>
          )}
        </FormWrapper>

        <ModalFooter>
          <button className="btn cancel" onClick={onClose}>
            {translate('Cancel')}
          </button>
          <button
            className={classes('btn submit', !enabled && 'disabled')}
            onClick={handleDelete}
            disabled={isLoading || !enabled}
          >
            <LoadingText
              loadingText={translate(isBulkDelete ? 'Clearing' : 'Deleting')}
              loading={isLoading}
              spinner
            >
              {translate(isBulkDelete ? 'Clear All' : 'Delete')}
            </LoadingText>
          </button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};
