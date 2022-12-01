import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPage } from '@editor/store/slices/context';

import { selectPage } from '../../../../store/slices/pages';

import { Page } from './page/page';
import { PageTabs } from './page-tabs/page-tabs';
import { FieldLayoutWrapper } from './field-layout.styles';

export const FieldLayout: React.FC = () => {
  const { uid: pageUid } = useSelector(selectCurrentPage);
  const page = useSelector(selectPage(pageUid));

  return (
    <FieldLayoutWrapper>
      <PageTabs />
      <Page page={page} />
    </FieldLayoutWrapper>
  );
};
