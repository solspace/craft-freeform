import React from 'react';
import { useSelector } from 'react-redux';

import { selectRowsInLayout } from '../../../store/slices/rows';
import { Layout as LayoutType } from '../../../types/layout';
import { Row } from '../row/row';
import { Wrapper } from './layout.styles';

type Props = {
  layout: LayoutType;
};

export const Layout: React.FC<Props> = ({ layout }) => {
  const rows = useSelector(selectRowsInLayout(layout));

  if (!layout) {
    return null;
  }

  return (
    <Wrapper>
      {rows.map((row) => (
        <Row row={row} key={row.uid} />
      ))}
    </Wrapper>
  );
};
