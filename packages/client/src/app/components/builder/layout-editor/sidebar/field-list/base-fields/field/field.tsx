import React from 'react';
import { useDrag } from 'react-dnd';
import { v4 } from 'uuid';

import { add } from '@ff-client/app/components/builder/store/slices/cells';
import { useAppDispatch } from '@ff-client/app/components/builder/store/store';
import { CellType } from '@ff-client/app/components/builder/types/layout';
import { FieldType } from '@ff-client/types/fields';

import { Icon, Name, Wrapper } from './field.styles';

type Props = {
  fieldType: FieldType;
};

export const Field: React.FC<Props> = ({ fieldType }) => {
  const dispatch = useAppDispatch();

  const onClick = (): void => {
    dispatch(
      add({
        uid: v4(),
        rowUid: 'row-uid-1',
        type: CellType.Field,
        metadata: {},
        order: 0,
      })
    );
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
