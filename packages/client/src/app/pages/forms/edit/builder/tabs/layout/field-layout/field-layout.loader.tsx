import React from 'react';

import { LoaderPage } from './page/page.loader';
import { LoaderPageTabs } from './page-tabs/page-tabs.loader';
import { FieldLayoutWrapper } from './field-layout.styles';

export const LoaderFieldLayout: React.FC = () => {
  return (
    <FieldLayoutWrapper>
      <LoaderPageTabs />
      <LoaderPage />
    </FieldLayoutWrapper>
  );
};
