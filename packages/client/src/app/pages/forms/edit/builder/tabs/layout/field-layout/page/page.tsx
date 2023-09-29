import React from 'react';
import type { Page as PageType } from '@editor/builder/types/layout';
import { useAppSelector } from '@editor/store';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';

import { Layout } from '../layout/layout';

import { PageButtons } from './page-buttons/page-buttons';
import { PageWrapper } from './pages.styles';

type Props = {
  page: PageType;
};

export const Page: React.FC<Props> = ({ page }) => {
  const layout = useAppSelector((state) =>
    layoutSelectors.pageLayout(state, page?.layoutUid)
  );

  return (
    <PageWrapper>
      {layout && <Layout layout={layout} />}
      <PageButtons page={page} />
    </PageWrapper>
  );
};
