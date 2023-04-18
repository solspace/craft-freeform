import React from 'react';
import { useSelector } from 'react-redux';
import type { Page as PageType } from '@editor/builder/types/layout';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';

import { Layout } from '../layout/layout';

import { PageButton, PageWrapper } from './pages.styles';

type Props = {
  page: PageType;
};

export const Page: React.FC<Props> = ({ page }) => {
  const layout = useSelector(layoutSelectors.pageLayout(page));

  return (
    <PageWrapper>
      <PageButton>{page.label}</PageButton>
      {layout && <Layout layout={layout} />}
    </PageWrapper>
  );
};
