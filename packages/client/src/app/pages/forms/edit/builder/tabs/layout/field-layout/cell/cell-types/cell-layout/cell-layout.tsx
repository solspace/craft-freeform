import React from 'react';
import { useSelector } from 'react-redux';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';

import { Layout } from '../../../layout/layout';

import { CellLayoutWrapper } from './cell-layout.styles';

type Props = {
  uid: string;
};

export const CellLayout: React.FC<Props> = ({ uid }) => {
  const layout = useSelector(layoutSelectors.one(uid));

  if (!layout) {
    return null;
  }

  return (
    <CellLayoutWrapper>
      <h3>Group Field</h3>
      <Layout layout={layout} />
    </CellLayoutWrapper>
  );
};
