import React from 'react';

import { Cell as CellPropType, CellType } from '../../../types/layout';
import { CellField } from './cell-types/cell-field/cell-field';
import { CellLayout } from './cell-types/cell-layout/cell-layout';
import { Wrapper } from './cell.styles';

type Props = {
  cell: CellPropType;
  order?: number;
};

export const Cell: React.FC<Props> = ({ cell, order }) => {
  let component = null;

  if (cell.type === CellType.Layout) {
    component = <CellLayout layoutUid={cell.metadata.layoutUid} />;
  } else {
    component = <CellField fieldUid={cell.uid} />;
  }

  return <Wrapper style={{ order }}>{component}</Wrapper>;
};
