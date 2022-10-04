import React from 'react';
import { useSelector } from 'react-redux';

import { selectPage } from '../../../../store/slices/pages';
import { FieldLayoutWrapper } from './field-layout.styles';
import { PageTabs } from './page-tabs/page-tabs';
import { Page } from './page/page';

export const FieldLayout: React.FC = () => {
  const page = useSelector(selectPage('page-uid-1'));

  return (
    <FieldLayoutWrapper>
      <PageTabs />
      <Page page={page} />
    </FieldLayoutWrapper>
  );
};
