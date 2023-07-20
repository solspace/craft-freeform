import React, { useState } from 'react';
import type { Cell } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { removeCell } from '@editor/store/thunks/cells';

import DeleteIcon from './delete.svg';
import { useRemoveAnimation } from './remove.animations';
import { RemoveButtonWrapper } from './remove.styles';

type Props = {
  cell: Cell;
  active: boolean;
};

export const Remove: React.FC<Props> = ({ cell, active }) => {
  const dispatch = useAppDispatch();

  const [hovering, setHovering] = useState(false);
  const animation = useRemoveAnimation({ active, hovering });

  return (
    <RemoveButtonWrapper
      style={animation}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => dispatch(removeCell(cell))}
    >
      <DeleteIcon />
    </RemoveButtonWrapper>
  );
};
