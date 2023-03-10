import React from 'react';
import { useSelector } from 'react-redux';
import { selectLayout } from '@ff-client/app/pages/forms/edit/store/slices/layouts';

import { Layout } from '../../../layout/layout';

type Props = {
  uid: string;
};

export const CellLayout: React.FC<Props> = ({ uid }) => {
  const layout = useSelector(selectLayout(uid));

  if (!layout) {
    return null;
  }

  return <Layout layout={layout} />;
};
