import React from 'react';
import { useSelector } from 'react-redux';

import { selectPage } from '../../../../store/slices/pages';

import { Page } from './page/page';
import { PageTabs } from './page-tabs/page-tabs';
import { FieldLayoutWrapper } from './field-layout.styles';

export const FieldLayout: React.FC = () => {
  const page = useSelector(selectPage('page-uid-1'));

  return (
    <FieldLayoutWrapper>
      <PageTabs />
      <Page page={page} />
    </FieldLayoutWrapper>
  );
};
