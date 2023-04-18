import React from 'react';
import type { Cell as CellPropType } from '@editor/builder/types/layout';
import { CellType } from '@editor/builder/types/layout';

import { CellField } from './cell-types/cell-field/cell-field';
import { CellLayout } from './cell-types/cell-layout/cell-layout';
import { CellWrapper } from './cell.styles';

type Props = {
  cell: CellPropType;
};

export const Cell: React.FC<Props> = ({ cell }) => {
  let Component;
  switch (cell.type) {
    case CellType.Field:
      Component = CellField;
      break;

    case CellType.Layout:
      Component = CellLayout;
      break;
  }

  return (
    <CellWrapper>
      <Component uid={cell.targetUid} />
    </CellWrapper>
  );
};
