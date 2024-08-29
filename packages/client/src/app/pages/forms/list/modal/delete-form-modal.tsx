import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import type { ModalContainerProps } from '@components/modals/modal.types';
import config, { Edition } from '@config/freeform/freeform.config';
import { useSiteContext } from '@ff-client/contexts/site/site.context';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import { QKForms } from '@ff-client/queries/forms';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useDeleteFormGroupsMutation } from '../list.mutations';

import { FormWrapper } from './form-modal.styles';

export const DeleteFormModal: React.FC<ModalContainerProps> = ({
  data,
  closeModal,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const isProEdition = config.editions.isAtLeast(Edition.Pro);
  const deleteFormGroupsMutation = useDeleteFormGroupsMutation(true);

  const queryClient = useQueryClient();
  const { getCurrentHandleWithFallback } = useSiteContext();

  useOnKeypress(
    {
      callback: (event: KeyboardEvent): void => {
        switch (event.key) {
          case 'Enter':
            handleDelete();
            return;
        }
      },
    },
    [enabled]
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value);
  };

  const handleDelete = async (): Promise<void> => {
    if (!enabled) {
      return;
    }

    setIsDeleting(true);

    try {
      await axios.post(`/api/forms/delete`, { id: data?.form.id });

      if (isProEdition) {
        await deleteFormGroupsMutation.mutateAsync(data?.form.id);
      } else {
        await queryClient.invalidateQueries(
          QKForms.all(getCurrentHandleWithFallback())
        );
      }

      setInputValue('');
      setEnabled(false);

      closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setEnabled(inputValue.toUpperCase() === 'DELETE');
  }, [inputValue]);

  return (
    <ModalContainer>
      <ModalHeader>
        <h1>{data?.form.name}</h1>
      </ModalHeader>

      <FormWrapper>
        <div>
          {translate(
            'Are you sure you want to permanently delete this form? This action cannot be undone.'
          )}
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: translate(
              'To delete this form, please type <strong>DELETE</strong> in the box below:'
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
        <button className="btn cancel" onClick={closeModal}>
          {translate('Cancel')}
        </button>
        <button
          className={classes('btn submit', !enabled && 'disabled')}
          onClick={handleDelete}
        >
          <LoadingText
            loadingText={translate('Deleting')}
            loading={isDeleting}
            spinner
          >
            {translate('Delete')}
          </LoadingText>
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
