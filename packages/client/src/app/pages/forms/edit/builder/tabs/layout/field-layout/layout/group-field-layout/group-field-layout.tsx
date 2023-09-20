import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@editor/store';
import type { Field } from '@editor/store/slices/layout/fields';
import { fieldActions } from '@editor/store/slices/layout/fields';
import { layoutActions } from '@editor/store/slices/layout/layouts';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';
import { rowSelectors } from '@editor/store/slices/layout/rows/rows.selectors';
import translate from '@ff-client/utils/translations';
import { v4 } from 'uuid';

import { Row } from '../../row/row';
import { useLayoutDrop } from '../layout.drop';

import {
  EmptyLayout,
  GroupDropZone,
  GroupFieldLayoutWrapper,
} from './group-field-layout.styles';

type Props = {
  field: Field;
  layoutUid?: string;
};

export const GroupFieldLayout: React.FC<Props> = ({ field, layoutUid }) => {
  const dispatch = useAppDispatch();
  const layout = useSelector((state) => layoutSelectors.one(state, layoutUid));
  const rows = useAppSelector((state) =>
    rowSelectors.inLayout(state, layout?.uid)
  );

  const { dropRef, placeholderAnimation } = useLayoutDrop(layout);

  useEffect(() => {
    if (!layoutUid) {
      const uid = v4();

      dispatch(layoutActions.add({ uid }));
      dispatch(
        fieldActions.edit({ uid: field.uid, handle: 'layout', value: uid })
      );
    }
  }, []);

  return (
    <GroupFieldLayoutWrapper ref={dropRef}>
      {!rows.length && <EmptyLayout>Add fields</EmptyLayout>}
      {rows.map((row) => (
        <Row row={row} key={row.uid} />
      ))}
      <GroupDropZone style={placeholderAnimation}>
        {translate('Drop a field here')}
      </GroupDropZone>
    </GroupFieldLayoutWrapper>
  );
};
