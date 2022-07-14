import React from 'react';
import { useDrag } from 'react-dnd';
import { v4 } from 'uuid';

import { add as addCell } from '@ff-client/app/components/builder/store/slices/cells';
import { add as addRow } from '@ff-client/app/components/builder/store/slices/rows';
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
    const rowUid = v4();

    dispatch(
      addRow({
        layoutUid: 'layout-uid-1',
        order: 2,
        uid: rowUid,
      })
    );
    dispatch(
      addCell({
        uid: v4(),
        rowUid: rowUid,
        type: CellType.Field,
        metadata: {},
        order: 0,
      })
    );
  };

  const [_, drag] = useDrag(() => ({
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
