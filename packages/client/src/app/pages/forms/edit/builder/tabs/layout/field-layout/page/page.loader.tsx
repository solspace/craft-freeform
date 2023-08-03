import React from 'react';

import { LoaderLayout } from '../layout/layout.loader';

import { LoaderPageButtons } from './page-buttons/page-buttons.loader';
import { PageWrapper } from './pages.styles';

export const LoaderPage: React.FC = () => {
  return (
    <PageWrapper>
      <LoaderLayout />
      <LoaderPageButtons />
    </PageWrapper>
  );
};
