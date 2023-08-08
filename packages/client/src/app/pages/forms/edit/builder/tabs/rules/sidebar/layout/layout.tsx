import React from 'react';
import { useSelector } from 'react-redux';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';
import { rowSelectors } from '@editor/store/slices/layout/rows/rows.selectors';

import { Row } from '../row/row';

import { FieldLayoutWrapper } from './layout.styles';

type Props = {
  layoutUid: string;
};

export const Layout: React.FC<Props> = ({ layoutUid }) => {
  const layout = useSelector(layoutSelectors.one(layoutUid));
  const rows = useSelector(rowSelectors.inLayout(layout));

  if (!layout || !rows.length) {
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
