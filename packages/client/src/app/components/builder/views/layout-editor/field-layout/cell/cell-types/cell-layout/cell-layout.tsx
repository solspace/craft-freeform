import React from 'react';
import { useSelector } from 'react-redux';

import { selectLayout } from '@ff-client/app/components/builder/store/slices/layouts';

import { Layout } from '../../../layout/layout';

type Props = {
  layoutUid: string;
};

export const CellLayout: React.FC<Props> = ({ layoutUid }) => {
  const layout = useSelector(selectLayout(layoutUid));

  if (!layout) {
    return null;
  }

  return <Layout layout={layout} />;
};
