import React from 'react';
import { useAppDispatch } from '@editor/store';
import { fieldThunks } from '@editor/store/thunks/fields';
import { useFieldType } from '@ff-client/queries/field-types';
import type { FieldFavorite } from '@ff-client/types/fields';

import { Field } from '../../field-group/field/field';
import { useBaseFieldDrag } from '../base-fields/field-item.drag';

import { cloneFieldTypeFromFavorite } from './field-item.operations';

type Props = {
  favorite: FieldFavorite;
};

export const FieldItem: React.FC<Props> = ({ favorite }) => {
  const { typeClass, label } = favorite;
  const fieldType = useFieldType(typeClass);

  const clonedFieldType = cloneFieldTypeFromFavorite(favorite, fieldType);

  const dispatch = useAppDispatch();
  const { ref } = useBaseFieldDrag(clonedFieldType);

  if (!fieldType || !clonedFieldType) {
    return null;
  }

  const { icon } = fieldType;

  const onClick = (): void => {
    dispatch(fieldThunks.move.newField.newRow({ fieldType: clonedFieldType }));
  };

  return <Field icon={icon} label={label} onClick={onClick} dragRef={ref} />;
};
