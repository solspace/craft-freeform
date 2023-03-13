import React from 'react';
import { useSelector } from 'react-redux';
import type { Page as PageType } from '@editor/builder/types/layout';
import { selectPageLayout } from '@editor/store/slices/layouts';

import { Layout } from '../layout/layout';

import { PageWrapper } from './pages.styles';

type Props = {
  page: PageType;
};

export const Page: React.FC<Props> = ({ page }) => {
  const layout = useSelector(selectPageLayout(page));

  return <PageWrapper>{layout && <Layout layout={layout} />}</PageWrapper>;
};
