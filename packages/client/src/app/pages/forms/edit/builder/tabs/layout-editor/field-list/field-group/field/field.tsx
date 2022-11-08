import React from 'react';
import { useDrag } from 'react-dnd';
import { useAppDispatch } from '@editor/store';
import { addNewField } from '@editor/store/thunks/fields';
import type { FieldType } from '@ff-client/types/fields';

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
