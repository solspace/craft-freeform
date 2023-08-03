import React from 'react';

import { LoaderRow } from '../row/row.loader';

import { PageFieldLayoutWrapper } from './layout.styles';

export const LoaderLayout: React.FC = () => {
  return (
    <PageFieldLayoutWrapper>
      <LoaderRow />
      <LoaderRow />
      <LoaderRow />
      <LoaderRow />
    </PageFieldLayoutWrapper>
  );
};
