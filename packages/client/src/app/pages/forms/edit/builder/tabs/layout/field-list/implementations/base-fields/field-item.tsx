import React from 'react';
import { useAppDispatch } from '@editor/store';
import { fieldThunks } from '@editor/store/thunks/fields';
import { useFieldType } from '@ff-client/queries/field-types';

import { Field } from '../../field-group/field/field';

import { useBaseFieldDrag } from './field-item.drag';

type Props = {
  typeClass: string;
};

export const FieldItem: React.FC<Props> = ({ typeClass }) => {
  const fieldType = useFieldType(typeClass);

  const dispatch = useAppDispatch();
  const { ref } = useBaseFieldDrag(fieldType);

  const onClick = (): void => {
    dispatch(fieldThunks.move.newField.newRow({ fieldType }));
  };

  return (
    <Field
      label={fieldType?.name}
      icon={fieldType?.icon}
      onClick={onClick}
      dragRef={ref}
    />
  );
};
