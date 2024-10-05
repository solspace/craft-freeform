import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import config from '@config/freeform/freeform.config';
import { useLastTab } from '@editor/builder/tabs/tabs.hooks';
import type { Page as PageType } from '@editor/builder/types/layout';
import { pageRuleSelectors } from '@editor/store/slices/rules/pages/page-rules.selectors';
import classes from '@ff-client/utils/classes';

import { Layout } from '../layout/layout';

import { Buttons } from './buttons/buttons';
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
  const canEdit = config.limitations.can('rules.tab.pages');
  const { uid: activePageUid, button } = useParams();
  const navigate = useNavigate();
  const { setLastTab } = useLastTab('rules');

  const hasRule = useSelector(pageRuleSelectors.hasRule(page.uid));

  const { label, uid } = page;
  const currentPage = activePageUid === uid && !button;

  return (
    <PageWrapper>
      <PageButton
        onClick={() => {
          if (canEdit) {
            const tab = currentPage ? '' : `page/${uid}`;
            setLastTab(tab);
            navigate(tab);
          }
        }}
        className={classes(
          currentPage && 'active',
          hasRule && 'has-rule',
          !canEdit && 'read-only'
        )}
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
        <Buttons page={page} />
      </PageBody>
    </PageWrapper>
  );
};
