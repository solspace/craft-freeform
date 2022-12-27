import React from 'react';
import { useSelector } from 'react-redux';
import type { Layout as LayoutType } from '@editor/builder/types/layout';
import { selectRowsInLayout } from '@editor/store/slices/rows';
import translate from '@ff-client/utils/translations';

import { Row } from '../row/row';

import { useLayoutDrop } from './layout.drop';
import { DropZone, FieldLayoutWrapper } from './layout.styles';

type Props = {
  layout: LayoutType;
};

export const Layout: React.FC<Props> = ({ layout }) => {
  const rows = useSelector(selectRowsInLayout(layout));
  const { dropRef, placeholderAnimation } = useLayoutDrop(layout);

  return (
    <FieldLayoutWrapper ref={dropRef}>
      {!rows.length && (
        <div>Drag or click fields to add them to the layout</div>
      )}
      {rows.map((row) => (
        <Row row={row} key={row.uid} />
      ))}
      <DropZone style={placeholderAnimation}>
        {translate('+ insert row')}
      </DropZone>
    </FieldLayoutWrapper>
  );
};
