import React from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@editor/store';
import { FocusType, setFocusedItem } from '@editor/store/slices/context';
import { selectField } from '@editor/store/slices/fields';
import { useFieldType } from '@ff-client/queries/field-types';

import { CellFieldWrapper, Label } from './cell-field.styles';

type Props = {
  uid: string;
};

export const CellField: React.FC<Props> = ({ uid }) => {
  const field = useSelector(selectField(uid));
  const type = useFieldType(field?.typeClass);
  const dispatch = useAppDispatch();

  if (field?.properties === undefined) {
    return null;
  }

  return (
    <CellFieldWrapper
      onClick={(): void => {
        dispatch(setFocusedItem({ type: FocusType.Field, uid }));
      }}
    >
      <Label>{field.properties.label || type?.name}</Label>
      <div>
        <input type="text" className="text fullwidth" />
      </div>
    </CellFieldWrapper>
  );
};
