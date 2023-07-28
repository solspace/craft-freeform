import React from 'react';
import { useAppDispatch } from '@editor/store';
import { fieldThunks } from '@editor/store/thunks/fields';
import type { FieldType } from '@ff-client/types/properties';

import { Field } from '../../field-group/field/field';

import { useBaseFieldDrag } from './field-item.drag';

type Props = {
  fieldType: FieldType;
};

export const FieldItem: React.FC<Props> = ({ fieldType }) => {
  const { icon, name } = fieldType;

  const dispatch = useAppDispatch();
  const { ref } = useBaseFieldDrag(fieldType);

  const onClick = (): void => {
    dispatch(fieldThunks.move.newField.newRow({ fieldType }));
  };

  return <Field icon={icon} label={name} onClick={onClick} dragRef={ref} />;
};
