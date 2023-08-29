import React, { useState } from 'react';
import { useAppDispatch } from '@editor/store';
import { contextActions } from '@editor/store/slices/context';
import type { Field } from '@editor/store/slices/layout/fields';
import { fieldThunks } from '@editor/store/thunks/fields';

import DeleteIcon from './delete.svg';
import { useRemoveAnimation } from './remove.animations';
import { RemoveButtonWrapper } from './remove.styles';

type Props = {
  field: Field;
  active: boolean;
};

export const Remove: React.FC<Props> = ({ field, active }) => {
  const dispatch = useAppDispatch();

  const [hovering, setHovering] = useState(false);
  const animation = useRemoveAnimation({ active, hovering });

  return (
    <RemoveButtonWrapper
      style={animation}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={(event) => {
        event.stopPropagation();
        dispatch(contextActions.unfocus());
        dispatch(fieldThunks.remove(field));
      }}
    >
      <DeleteIcon />
    </RemoveButtonWrapper>
  );
};
