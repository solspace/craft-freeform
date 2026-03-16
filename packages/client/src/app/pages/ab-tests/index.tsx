import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { FlexRow } from '@components/layout/blocks/flex';
import { HeaderContainer } from '@components/layout/blocks/header-container';
import { useModal } from '@components/modals/modal.context';
import { useSidebarSelect } from '@ff-client/hooks/use-sidebar-select';
import translate from '@ff-client/utils/translations';
import { isFuture, isPast } from 'date-fns';

import { ABTestCard } from './ab-tests.card';
import { ABTestChart } from './ab-tests.chart';
import { ABTestModal } from './ab-tests.modal';
import { ABTestDeleteModal } from './ab-tests.modal.delete';
import { toEditorPayload } from './ab-tests.operations';
import { useAbTestsDashboard } from './ab-tests.queries';
import {
  Card,
  CardHeader,
  Cards,
  Dot,
  EmptyState,
  HeaderRow,
  Meta,
  PageWrapper,
  Variants,
} from './ab-tests.styles';
import type {
  ABStatus,
  ABTestDashboardItem,
  MetricTab,
} from './ab-tests.types';

export const AbTests: React.FC = () => {
  useSidebarSelect('ab-tests');
  const { openModal } = useModal();
  const [searchParams] = useSearchParams();
  const { data } = useAbTestsDashboard();
  const [tabState, setTabState] = useState<Record<number, MetricTab>>({});
  const autoOpenRef = useRef<string | null>(null);

  const openEditor = (test?: ABTestDashboardItem): void => {
    openModal(ABTestModal, test ? { test: toEditorPayload(test) } : {});
  };

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId || !data || autoOpenRef.current === editId) {
      return;
    }

    const test = data.find((item) => item.id === Number(editId));
    if (!test) {
      return;
    }

    autoOpenRef.current = editId;
    openEditor(test);
  }, [searchParams, data]);

  return (
    <>
      <Breadcrumb id="ab-tests-list" label="A/B Tests" url="/ab-tests" />
      <HeaderRow>
        <HeaderContainer>{translate('A/B Tests')}</HeaderContainer>
        <button className="btn submit add icon" onClick={() => openEditor()}>
          {translate('Add Test')}
        </button>
      </HeaderRow>

      <PageWrapper>
        {!data?.length && (
          <EmptyState>
            {translate('No A/B Tests found. Create your first test.')}
          </EmptyState>
        )}

        <Cards>
          {data?.map((test) => {
            const activeTab = tabState[test.id] || 'conversionRate';
            const isInFuture = test.startDate && isFuture(test.startDate);
            const isInPast = test.endDate && isPast(test.endDate);

            let status: ABStatus = 'active';
            if (isInFuture) {
              status = 'scheduled';
            } else if (isInPast) {
              status = 'ended';
            }

            const statusLabel = translate(
              status.at(0)?.toUpperCase() + status.slice(1) || ''
            );

            return (
              <Card key={test.id}>
                <CardHeader>
                  <div>
                    <h2>{test.name}</h2>
                    {!!test.description && <p>{test.description}</p>}

                    <Meta>
                      <Dot $status={status} />
                      <span>{translate(statusLabel)}</span>
                      {!isInFuture && (
                        <>
                          <span>•</span>
                          <span>
                            {translate('{days} days', { days: test.days })}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {translate('{count} variants', {
                          count: test.variantCount,
                        })}
                      </span>
                      <span>•</span>
                      <span>
                        {translate('{count} impressions', {
                          count: test.totalImpressions.toLocaleString(),
                        })}
                      </span>
                    </Meta>
                  </div>

                  <FlexRow>
                    <button
                      type="button"
                      className="btn icon delete"
                      onClick={() =>
                        openModal(ABTestDeleteModal, {
                          id: test.id,
                          name: test.name,
                        })
                      }
                    >
                      {translate('Delete')}
                    </button>

                    <button
                      type="button"
                      className="btn icon edit"
                      onClick={() => openEditor(test)}
                    >
                      {translate('Edit')}
                    </button>
                  </FlexRow>
                </CardHeader>

                <ABTestChart
                  test={test}
                  activeTab={activeTab}
                  setTab={(tabTest, tabId) => {
                    setTabState((prev) => ({
                      ...prev,
                      [tabTest.id]: tabId,
                    }));
                  }}
                />

                <Variants>
                  {test.variants.map((variant) => (
                    <ABTestCard
                      key={variant.id}
                      variant={variant}
                      test={test}
                    />
                  ))}
                </Variants>
              </Card>
            );
          })}
        </Cards>
      </PageWrapper>
    </>
  );
};
