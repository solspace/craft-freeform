import React from 'react';
import { useSelector } from 'react-redux';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';

import { Layout } from '../../../layout/layout';

type Props = {
  uid: string;
};

export const CellLayout: React.FC<Props> = ({ uid }) => {
  const layout = useSelector(layoutSelectors.one(uid));

  if (!layout) {
    return null;
  }

  return <Layout layout={layout} />;
};
