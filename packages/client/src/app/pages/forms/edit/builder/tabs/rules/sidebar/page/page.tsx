import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { Page as PageType } from '@editor/builder/types/layout';
import { pageRuleSelectors } from '@editor/store/slices/rules/pages/page-rules.selectors';
import classes from '@ff-client/utils/classes';

import { Layout } from '../layout/layout';

import PageIconSvg from './page-icon.svg';
import {
  PageBody,
  PageButton,
  PageIcon,
  PageLabel,
  PageWrapper,
} from './pages.styles';
type Props = {
  page: PageType;
};

export const Page: React.FC<Props> = ({ page }) => {
  const { uid: activePageUid } = useParams();
  const navigate = useNavigate();

  const hasRule = useSelector(pageRuleSelectors.hasRule(page.uid));

  const { label, uid } = page;
  const currentPage = activePageUid === uid;

  return (
    <PageWrapper>
      <PageButton
        onClick={() => navigate(activePageUid === uid ? '' : `page/${uid}`)}
        className={classes(currentPage && 'active', hasRule && 'has-rule')}
      >
        <PageIcon>
          <PageIconSvg />
        </PageIcon>
        <PageLabel>{label}</PageLabel>
      </PageButton>
      <PageBody
        className={classes(currentPage && 'active', hasRule && 'has-rule')}
      >
        <Layout layoutUid={page.layoutUid} />
      </PageBody>
    </PageWrapper>
  );
};
