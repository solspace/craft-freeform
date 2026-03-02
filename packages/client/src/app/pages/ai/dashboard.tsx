import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { HeaderContainer } from '@components/layout/blocks/header-container';
import { useSidebarSelect } from '@ff-client/hooks/use-sidebar-select';
import { colors } from '@ff-client/styles/variables';
import translate from '@ff-client/utils/translations';
import axios from 'axios';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  createCheckoutSession,
  isSolspaceAiUsageResponse,
  useAiUsageQuery,
} from './ai.queries';
import {
  Card,
  CardLabel,
  CardsGrid,
  CardValue,
  DashboardWrapper,
  EmptyState,
  EmptyStateTitle,
  MetricsTable,
  MetricsTableCell,
  MetricsTableHead,
  MetricsTableHeaderCell,
  MetricsTableRow,
  Section,
  SectionTitle,
  UsageChart,
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
  useSidebarSelect('freeform/ai');
  const [addCreditLoading, setAddCreditLoading] = React.useState(false);

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
  const dailyMetrics = data?.daily_metrics ?? [];
  const sortedMetrics = [...dailyMetrics].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const totalSpend =
    summary?.total_spend ??
    (sortedMetrics.length
      ? sortedMetrics.reduce((acc, item) => acc + (item.spend ?? 0), 0)
      : undefined);
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
      <HeaderContainer
        extra={
          (summary?.credit_remaining != null || summary?.max_budget != null) &&
          summary !== undefined && (
            <button
              type="button"
              className="btn submit"
              disabled={addCreditLoading}
              onClick={async () => {
                setAddCreditLoading(true);
                try {
                  const currentUrl = window.location.href;
                  const res = await createCheckoutSession(
                    currentUrl,
                    currentUrl
                  );
                  if (res?.url) {
                    window.location.href = res.url;
                  } else {
                    setAddCreditLoading(false);
                  }
                } catch {
                  setAddCreditLoading(false);
                }
              }}
            >
              {addCreditLoading
                ? translate('Loading…')
                : translate('Add credit')}
            </button>
          )
        }
      >
        {translate('AI')}
      </HeaderContainer>
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
          {summary?.credit_remaining != null && (
            <Card>
              <CardLabel>{translate('Credit remaining')}</CardLabel>
              <CardValue style={{ fontSize: 14 }}>
                {formatSpend(summary.credit_remaining)}
              </CardValue>
            </Card>
          )}
        </CardsGrid>

        {sortedMetrics.length > 0 && (
          <Section>
            <SectionTitle>{translate('Daily spend')}</SectionTitle>
            <UsageChart>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sortedMetrics}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) =>
                      new Date(value).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <YAxis
                    tickFormatter={(value: number) =>
                      `$${value.toFixed(3)}` as string
                    }
                  />
                  <RechartsTooltip
                    formatter={(value: number) => formatSpend(value as number)}
                    labelFormatter={(label: string) =>
                      new Date(label).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })
                    }
                  />
                  <Bar
                    dataKey="spend"
                    fill={colors.blue500}
                    stroke={colors.blue500}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </UsageChart>
          </Section>
        )}

        {sortedMetrics.length > 0 && (
          <Section>
            <SectionTitle>{translate('Recent daily usage')}</SectionTitle>
            <MetricsTable>
              <MetricsTableHead>
                <tr>
                  <MetricsTableHeaderCell>
                    {translate('Date')}
                  </MetricsTableHeaderCell>
                  <MetricsTableHeaderCell>
                    {translate('Spend')}
                  </MetricsTableHeaderCell>
                  <MetricsTableHeaderCell>
                    {translate('Requests')}
                  </MetricsTableHeaderCell>
                  <MetricsTableHeaderCell>
                    {translate('Tokens (prompt / completion / total)')}
                  </MetricsTableHeaderCell>
                </tr>
              </MetricsTableHead>
              <tbody>
                {sortedMetrics.map((item) => (
                  <MetricsTableRow key={item.date}>
                    <MetricsTableCell>
                      {new Date(item.date).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })}
                    </MetricsTableCell>
                    <MetricsTableCell>
                      {formatSpend(item.spend)}
                    </MetricsTableCell>
                    <MetricsTableCell>
                      <span style={{ color: colors.success }}>
                        {item.successful_requests.toLocaleString()}{' '}
                        {translate('success')}
                      </span>{' '}
                      /{' '}
                      <span style={{ color: colors.error }}>
                        {item.failed_requests.toLocaleString()}{' '}
                        {translate('failed')}
                      </span>
                      {' · '}
                      {`${item.api_requests.toLocaleString()} ${translate('total')}`}
                    </MetricsTableCell>
                    <MetricsTableCell>
                      {item.prompt_tokens.toLocaleString()} /{' '}
                      {item.completion_tokens.toLocaleString()} /{' '}
                      {item.total_tokens.toLocaleString()}
                    </MetricsTableCell>
                  </MetricsTableRow>
                ))}
              </tbody>
            </MetricsTable>
          </Section>
        )}

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
