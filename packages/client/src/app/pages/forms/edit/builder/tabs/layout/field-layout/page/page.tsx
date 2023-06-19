import React from 'react';
import { useSelector } from 'react-redux';
import type { Page as PageType } from '@editor/builder/types/layout';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';

import { Layout } from '../layout/layout';

import { PageButtons } from './page-buttons/page-buttons';
import { PageWrapper } from './pages.styles';

type Props = {
  page: PageType;
};

export const Page: React.FC<Props> = ({ page }) => {
  const layout = useSelector(layoutSelectors.pageLayout(page));

  return (
    <PageWrapper>
      {layout && <Layout layout={layout} />}
      <PageButtons page={page} />
    </PageWrapper>
  );
};
