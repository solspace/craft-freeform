import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPage } from '@editor/store/slices/context';

import { Page } from './page/page';
import { PageTabs } from './page-tabs/page-tabs';
import { FieldLayoutWrapper } from './field-layout.styles';

export const FieldLayout: React.FC = () => {
  const page = useSelector(selectCurrentPage);

  return (
    <FieldLayoutWrapper>
      <PageTabs />
      {page && <Page page={page} />}
    </FieldLayoutWrapper>
  );
};
