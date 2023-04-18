import React from 'react';
import { useSelector } from 'react-redux';
import type { Row as RowType } from '@editor/builder/types/layout';
import { cellSelectors } from '@editor/store/slices/layout/cells/cells.selectors';

import { Cell } from '../cell/cell';

import { RowWrapper } from './row.styles';

type Props = {
  row: RowType;
};

export const Row: React.FC<Props> = ({ row }) => {
  const cells = useSelector(cellSelectors.inRow(row));

  return (
    <RowWrapper>
      {cells.map((cell) => (
        <Cell key={cell.uid} cell={cell} />
      ))}
    </RowWrapper>
  );
};
