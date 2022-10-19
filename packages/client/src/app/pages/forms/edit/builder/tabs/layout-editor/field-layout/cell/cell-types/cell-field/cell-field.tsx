import React from 'react';
import { useSelector } from 'react-redux';
import { Text } from '@ff-client/app/components/form-controls/controls/text';
import {
  FocusType,
  setFocusedItem,
} from '@ff-client/app/pages/forms/edit/store/slices/context';
import { selectField } from '@ff-client/app/pages/forms/edit/store/slices/fields';
import { useAppDispatch } from '@ff-client/app/pages/forms/edit/store/store';
import { useFieldType } from '@ff-client/queries/field-types';

import { CellFieldWrapper, Label } from './cell-field.styles';

type Props = {
  uid: string;
};

export const CellField: React.FC<Props> = ({ uid }) => {
  const field = useSelector(selectField(uid));
  const type = useFieldType(field?.typeClass);
  const dispatch = useAppDispatch();

  return (
    <CellFieldWrapper
      onClick={(): void => {
        dispatch(setFocusedItem({ type: FocusType.Field, uid }));
      }}
    >
      <Label>{field.properties.label || type.name}</Label>
      <Text />
    </CellFieldWrapper>
  );
};
