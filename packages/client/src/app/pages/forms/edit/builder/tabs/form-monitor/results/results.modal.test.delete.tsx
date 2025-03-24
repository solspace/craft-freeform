import React from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import { Modal } from '@ff-client/app/components/modals/modal';
import { useDeleteTestMutation } from '@ff-client/queries/form-monitor.mutations';
import translate from '@ff-client/utils/translations';

import { FormWrapper } from './results.modal.test.styles';

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
  const deleteTestMutation = useDeleteTestMutation(formId, testId, {
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const handleDelete = (): void => {
    deleteTestMutation.mutate();
  };

  return (
    <Modal closeModal={onClose}>
      <ModalContainer>
        <ModalHeader>
          <h1>{translate('Delete Test')}</h1>
        </ModalHeader>

        <FormWrapper>
          <div>
            {translate(
              'Are you sure you want to permanently delete this test? This action cannot be undone.'
            )}
          </div>
        </FormWrapper>

        <ModalFooter>
          <button className="btn cancel" onClick={onClose}>
            {translate('Cancel')}
          </button>
          <button
            className="btn submit"
            onClick={handleDelete}
            disabled={deleteTestMutation.isLoading}
          >
            <LoadingText
              loadingText={translate('Deleting')}
              loading={deleteTestMutation.isLoading}
              spinner
            >
              {translate('Delete')}
            </LoadingText>
          </button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};
