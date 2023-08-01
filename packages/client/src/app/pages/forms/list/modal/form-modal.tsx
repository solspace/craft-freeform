import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormComponent } from '@components/form-controls';

import { modalActions } from '../store/slices/modal';
import { modalSelectors } from '../store/slices/modal/modal.selectors';

import { FormModalLoading } from './form-modal.loading';
import { useFetchFormModalType } from './form-modal.queries';
import { FormWrapper } from './form-modal.styles';

export const CreateFormModal: React.FC = () => {
  const { data, isFetching } = useFetchFormModalType();

  const values = useSelector(modalSelectors.values);
  const errors = useSelector(modalSelectors.errors);
  const dispatch = useDispatch();

  return (
    <FormWrapper>
      {!data && isFetching && <FormModalLoading />}
      {data && (
        <>
          {data.map((property) => (
            <FormComponent
              key={property.handle}
              updateValue={(value) => {
                dispatch(
                  modalActions.update({
                    key: property.handle,
                    value,
                  })
                );
              }}
              value={values?.[property.handle]}
              property={property}
              errors={errors?.[property.handle] as unknown as string[]}
            />
          ))}
        </>
      )}
    </FormWrapper>
  );
};
