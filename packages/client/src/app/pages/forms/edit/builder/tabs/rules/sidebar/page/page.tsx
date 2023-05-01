import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { Page as PageType } from '@editor/builder/types/layout';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';
import { pageRuleSelectors } from '@editor/store/slices/rules/pages/page-rules.selectors';
import classes from '@ff-client/utils/classes';

import { CombinatorIcon } from '../cell/cell-types/cell-field/icons/combinator-icon';
import { Layout } from '../layout/layout';

import { PageButton, PageWrapper } from './pages.styles';

type Props = {
  page: PageType;
};

export const Page: React.FC<Props> = ({ page }) => {
  const { uid: activePageUid } = useParams();
  const navigate = useNavigate();

  const layout = useSelector(layoutSelectors.pageLayout(page));
  const hasRule = useSelector(pageRuleSelectors.hasRule(page.uid));
  const activeRule = useSelector(pageRuleSelectors.one(activePageUid));

  const { label, uid } = page;
  const currentPage = activePageUid === uid;

  return (
    <PageWrapper>
      <PageButton
        onClick={() => navigate(activePageUid === uid ? '' : `page/${uid}`)}
        className={classes(currentPage && 'active', hasRule && 'has-rule')}
      >
        {label}

        {currentPage && <CombinatorIcon combinator={activeRule?.combinator} />}
      </PageButton>
      {layout && <Layout layout={layout} />}
    </PageWrapper>
  );
};
