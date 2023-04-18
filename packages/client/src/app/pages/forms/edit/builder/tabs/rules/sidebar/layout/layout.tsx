import React from 'react';
import { useSelector } from 'react-redux';
import type { Layout as LayoutType } from '@editor/builder/types/layout';
import { rowSelectors } from '@editor/store/slices/layout/rows/rows.selectors';

import { Row } from '../row/row';

import { FieldLayoutWrapper } from './layout.styles';

type Props = {
  layout: LayoutType;
};

export const Layout: React.FC<Props> = ({ layout }) => {
  const rows = useSelector(rowSelectors.inLayout(layout));

  if (!rows.length) {
    return null;
  }

  return (
    <FieldLayoutWrapper>
      {rows.map((row) => (
        <Row row={row} key={row.uid} />
      ))}
    </FieldLayoutWrapper>
  );
};
