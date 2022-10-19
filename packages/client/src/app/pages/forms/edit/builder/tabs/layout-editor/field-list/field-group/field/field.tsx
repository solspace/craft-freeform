import React from 'react';
import { useDrag } from 'react-dnd';

import { addNewField } from '@ff-client/app/pages/forms/edit/store/actions/fields';
import { useAppDispatch } from '@ff-client/app/pages/forms/edit/store/store';
import { FieldType } from '@ff-client/types/fields';

import { Icon, Name, Wrapper } from './field.styles';

type Props = {
  fieldType: FieldType;
};

export const Field: React.FC<Props> = ({ fieldType }) => {
  const dispatch = useAppDispatch();

  const onClick = (): void => {
    dispatch(addNewField(fieldType));
  };

  const [, drag] = useDrag(() => ({
    type: 'BaseField',
    item: fieldType,
  }));

  return (
    <Wrapper ref={drag} onClick={onClick}>
      <Icon dangerouslySetInnerHTML={{ __html: fieldType.icon }} />
      <Name>{fieldType.name}</Name>
    </Wrapper>
  );
};
