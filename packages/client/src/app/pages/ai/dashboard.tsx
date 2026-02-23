import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { HeaderContainer } from '@components/layout/blocks/header-container';
import { useSidebarSelect } from '@ff-client/hooks/use-sidebar-select';
import translate from '@ff-client/utils/translations';
import axios from 'axios';

import { isSolspaceAiUsageResponse, useAiUsageQuery } from './ai.queries';
import {
  Card,
  CardLabel,
  CardsGrid,
  CardValue,
  DashboardWrapper,
  EmptyState,
  EmptyStateTitle,
} from './dashboard.styles';

function formatSpend(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  if (value < 0.01 && value > 0) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(2)}`;
}

export const AiDashboard: React.FC = () => {
  useSidebarSelect('ai');

  const { data, isFetching, error, isError } = useAiUsageQuery();
  const isNotFound =
    isError && axios.isAxiosError(error) && error.response?.status === 404;
  const isForbidden =
    isError && axios.isAxiosError(error) && error.response?.status === 403;

  if (isNotFound) {
    return (
      <div>
        <Breadcrumb id="ai" label="AI" url="ai" />
        <HeaderContainer>{translate('AI')}</HeaderContainer>
        <DashboardWrapper>
          <EmptyState>
            <EmptyStateTitle>
              {translate('Solspace AI is not enabled')}
            </EmptyStateTitle>
            <p>
              {translate(
                'Enable Solspace AI in the Integrations area to view usage and spend.'
              )}
            </p>
            <p style={{ marginTop: '1rem' }}>
              <Link to="/integrations" className="btn submit">
                {translate('Go to Integrations')}
              </Link>
            </p>
          </EmptyState>
        </DashboardWrapper>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div>
        <Breadcrumb id="ai" label="AI" url="ai" />
        <HeaderContainer>{translate('AI')}</HeaderContainer>
        <DashboardWrapper>
          <EmptyState>
            <EmptyStateTitle>
              {translate('Authorize Solspace AI to view usage')}
            </EmptyStateTitle>
            <p>
              {translate(
                'Authorize Solspace AI in the Integrations area (click Authorize on the Solspace AI integration) to view usage and spend.'
              )}
            </p>
            <p style={{ marginTop: '1rem' }}>
              <Link to="/integrations" className="btn submit">
                {translate('Go to Integrations')}
              </Link>
            </p>
          </EmptyState>
        </DashboardWrapper>
      </div>
    );
  }

  if (isFetching && !data) {
    return (
      <div>
        <Breadcrumb id="ai" label="AI" url="ai" />
        <HeaderContainer>{translate('AI')}</HeaderContainer>
        <DashboardWrapper>
          <CardsGrid>
            <Card>
              <CardLabel>
                <Skeleton width={80} height={10} />
              </CardLabel>
              <CardValue>
                <Skeleton width={100} height={24} />
              </CardValue>
            </Card>
            <Card>
              <CardLabel>
                <Skeleton width={80} height={10} />
              </CardLabel>
              <CardValue>
                <Skeleton width={140} height={18} />
              </CardValue>
            </Card>
            <Card>
              <CardLabel>
                <Skeleton width={80} height={10} />
              </CardLabel>
              <CardValue>
                <Skeleton width={120} height={18} />
              </CardValue>
            </Card>
          </CardsGrid>
        </DashboardWrapper>
      </div>
    );
  }

  if (isError) {
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : error instanceof Error
          ? error.message
          : translate('Failed to load usage data');
    return (
      <div>
        <Breadcrumb id="ai" label="AI" url="ai" />
        <HeaderContainer>{translate('AI')}</HeaderContainer>
        <DashboardWrapper>
          <EmptyState>
            <EmptyStateTitle>
              {translate('Error loading usage')}
            </EmptyStateTitle>
            <p>{message}</p>
          </EmptyState>
        </DashboardWrapper>
      </div>
    );
  }

  const summary = isSolspaceAiUsageResponse(data) ? data.summary : undefined;
  const totalSpend = summary?.total_spend;
  const hasAnyData = totalSpend !== undefined || summary != null;

  function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return Number.isNaN(d.getTime())
        ? iso
        : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
    } catch {
      return iso ?? '—';
    }
  }

  return (
    <div>
      <Breadcrumb id="ai" label="AI" url="ai" />
      <HeaderContainer>{translate('AI')}</HeaderContainer>
      <DashboardWrapper>
        <CardsGrid>
          {totalSpend !== undefined && (
            <Card>
              <CardLabel>{translate('Total spend')}</CardLabel>
              <CardValue>{formatSpend(totalSpend)}</CardValue>
            </Card>
          )}
          {summary?.account_email && (
            <Card>
              <CardLabel>{translate('Account')}</CardLabel>
              <CardValue style={{ fontSize: 14 }}>
                {summary.account_email}
              </CardValue>
            </Card>
          )}
          {summary?.created_at != null && (
            <Card>
              <CardLabel>{translate('Created')}</CardLabel>
              <CardValue style={{ fontSize: 14 }}>
                {formatDate(summary.created_at)}
              </CardValue>
            </Card>
          )}
          {summary && (
            <Card>
              <CardLabel>{translate('Budget')}</CardLabel>
              <CardValue style={{ fontSize: 14 }}>
                {summary.budget_unlimited ||
                summary.max_budget == null ||
                summary.max_budget <= 0
                  ? translate('Unlimited')
                  : formatSpend(summary.max_budget)}
              </CardValue>
            </Card>
          )}
        </CardsGrid>

        {!hasAnyData && (
          <EmptyState>
            <EmptyStateTitle>{translate('No usage data yet')}</EmptyStateTitle>
            <p>
              {translate(
                'Usage and spend will appear here once you use Solspace AI.'
              )}
            </p>
          </EmptyState>
        )}
      </DashboardWrapper>
    </div>
  );
};
