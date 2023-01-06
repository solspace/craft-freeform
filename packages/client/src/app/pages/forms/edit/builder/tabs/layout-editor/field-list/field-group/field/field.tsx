import React from 'react';
import { useAppDispatch } from '@editor/store';
import { addNewFieldToNewRow } from '@editor/store/thunks/fields';
import type { FieldType } from '@ff-client/types/fields';

import { useFieldDrag } from './field.drag';
import { Icon, Name, Wrapper } from './field.styles';

type Props = {
  fieldType: FieldType;
};

export const Field: React.FC<Props> = ({ fieldType }) => {
  const dispatch = useAppDispatch();
  const { drag } = useFieldDrag(fieldType);

  const onClick = (): void => {
    dispatch(addNewFieldToNewRow(fieldType));
  };

  return (
    <Wrapper ref={drag} onClick={onClick}>
      <Icon dangerouslySetInnerHTML={{ __html: fieldType.icon }} />
      <Name>{fieldType.name}</Name>
    </Wrapper>
  );
};
