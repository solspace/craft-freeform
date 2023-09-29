import React from 'react';
import { useAppSelector } from '@editor/store';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';
import { rowSelectors } from '@editor/store/slices/layout/rows/rows.selectors';

import { Row } from '../row/row';

import { FieldLayoutWrapper } from './layout.styles';

type Props = {
  layoutUid: string;
};

export const Layout: React.FC<Props> = ({ layoutUid }) => {
  const layout = useAppSelector((state) =>
    layoutSelectors.one(state, layoutUid)
  );
  const rows = useAppSelector((state) =>
    rowSelectors.inLayout(state, layout?.uid)
  );

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
