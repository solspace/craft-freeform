import React from 'react';
import { useAppDispatch } from '@editor/store';
import { addNewFieldToNewRow } from '@editor/store/thunks/fields';
import { useFieldType } from '@ff-client/queries/field-types';
import type { FieldBase } from '@ff-client/types/fields';

import { Field } from '../../field-group/field/field';
import { useBaseFieldDrag } from '../base-fields/field-item.drag';

import { cloneFieldTypeFromForm } from './field-item.operations';

type Props = {
  field: FieldBase;
};

export const FieldItem: React.FC<Props> = ({ field }) => {
  const { typeClass, label } = field;
  const fieldType = useFieldType(typeClass);

  const clonedFieldType = cloneFieldTypeFromForm(field, fieldType);

  const dispatch = useAppDispatch();
  const { ref } = useBaseFieldDrag(clonedFieldType);

  if (!fieldType) {
    return null;
  }

  const { icon } = fieldType;

  const onClick = (): void => {
    dispatch(addNewFieldToNewRow(clonedFieldType));
  };

  return <Field icon={icon} label={label} onClick={onClick} dragRef={ref} />;
};
