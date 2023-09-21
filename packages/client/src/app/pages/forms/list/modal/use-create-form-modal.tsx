import React from 'react';
import { useStore } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useModal } from '@components/modals/modal.context';
import type { Form } from '@ff-client/types/forms';
import axios from 'axios';

import type { RootState } from '../store';
import { modalActions } from '../store/slices/modal';
import { modalSelectors } from '../store/slices/modal/modal.selectors';

import { CreateFormModal } from './form-modal';

type CreateFormModal = () => () => void;

export const useCreateFormModal: CreateFormModal = () => {
  const { dispatch, getState } = useStore<RootState>();
  const { openModal } = useModal();

  const navigate = useNavigate();

  return (): void => {
    openModal({
      title: 'Create a New Form',
      content: <CreateFormModal />,
      onSave: async (): Promise<boolean> => {
        const values = modalSelectors.values(getState());
        try {
          const { data: form } = await axios.post<Form>(
            '/api/forms/modal',
            values
          );

          dispatch(modalActions.reset());
          dispatch(modalActions.clearErrors());

          navigate(`/forms/${form.id}`);

          return true;
        } catch (error) {
          dispatch(modalActions.setErrors(error.errors?.form));

          return false;
        }
      },
    });
  };
};
