import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormComponent } from '@components/form-controls';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import type { ModalContainerProps } from '@components/modals/modal.types';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import type { Form } from '@ff-client/types/forms';
import type { GenericValue } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';
import axios from 'axios';

import { FormModalLoading } from './form-modal.loading';
import { useFetchFormModalType } from './form-modal.queries';
import { FormWrapper } from './form-modal.styles';

export const CreateFormModal: React.FC<ModalContainerProps> = ({
  closeModal,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const [initialValues, setInitialValues] = useState<GenericValue>({});
  const [state, setState] = useState<GenericValue>({});
  const [errors, setErrors] = useState<GenericValue>();

  const { data, isFetching } = useFetchFormModalType();

  useEffect(() => {
    if (data) {
      const values = data?.reduce(
        (combined, current) => ({
          ...combined,
          [current.handle]: current.value,
        }),
        {}
      );

      setState(values);
      setInitialValues(values);
    }
  }, [data]);

  const navigate = useNavigate();

  useOnKeypress({
    callback: (event: KeyboardEvent): void => {
      switch (event.key) {
        case 'Enter':
          handleSave();
          return;
      }
    },
  });

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);

    try {
      const { data: form } = await axios.post<Form>('/api/forms/modal', state);

      setState({ ...initialValues });
      setErrors(undefined);

      navigate(`/forms/${form.id}`);

      closeModal();
    } catch (error) {
      setErrors(error.errors?.form);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalContainer>
      <ModalHeader>
        <h1>fdas</h1>
      </ModalHeader>

      <FormWrapper>
        {!data && isFetching && <FormModalLoading />}
        {data && (
          <>
            {data.map((property, idx) => (
              <FormComponent
                key={property.handle}
                updateValue={(value) => {
                  setState({
                    ...state,
                    [property.handle]: value,
                  });
                }}
                autoFocus={idx === 0}
                value={state?.[property.handle]}
                property={property}
                errors={errors?.[property.handle] as unknown as string[]}
              />
            ))}
          </>
        )}
      </FormWrapper>

      <ModalFooter>
        <button className="btn cancel" onClick={closeModal}>
          {translate('Close')}
        </button>
        <button className="btn submit" onClick={handleSave}>
          <LoadingText
            loadingText={translate('Saving')}
            loading={isSaving}
            spinner
          >
            {translate('Save')}
          </LoadingText>
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
