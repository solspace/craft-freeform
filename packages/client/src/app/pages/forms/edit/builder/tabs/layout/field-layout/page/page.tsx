import React from 'react';
import { useParams } from 'react-router-dom';
import type { Page as PageType } from '@editor/builder/types/layout';
import { useAppSelector } from '@editor/store';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';
import { useQueryFormNotifications } from '@ff-client/queries/notifications';
import { useQueryFormRules } from '@ff-client/queries/rules';

import { Layout } from '../layout/layout';

import { PageButtons } from './page-buttons/page-buttons';
import { PageWrapper } from './pages.styles';

type Props = {
  page: PageType;
};

export const Page: React.FC<Props> = ({ page }) => {
  const { formId } = useParams();
  const layout = useAppSelector((state) =>
    layoutSelectors.pageLayout(state, page?.layoutUid)
  );
  const { isFetched: isFormRulesFetched } = useQueryFormRules(
    Number(formId || 0)
  );
  const { isFetched: isFormNotificationsFetched } = useQueryFormNotifications(
    Number(formId || 0)
  );
  const { isFetched: isFormIntegrationsFetched } = useQueryFormNotifications(
    Number(formId || 0)
  );

  const isFetched =
    isFormRulesFetched &&
    isFormNotificationsFetched &&
    isFormIntegrationsFetched;

  return (
    <PageWrapper>
      {layout && isFetched && <Layout layout={layout} />}
      <PageButtons page={page} />
    </PageWrapper>
  );
};
