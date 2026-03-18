import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { HeaderContainer } from '@components/layout/blocks/header-container';
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

import { useAiUsageQuery } from './ai.queries';
import { formatAiDate, getSummaryModeLabel } from './ai.utils';
import {
  AiDashboardAccessState,
  AiDashboardLoadingState,
} from './dashboard.placeholders';
import {
  Card,
  CardLabel,
  CardsGrid,
  CardValue,
  CardValueSmall,
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

export const AiDashboard: React.FC = () => {
  const { data, isFetching, error, isError } = useAiUsageQuery();
  const isNotFound =
    isError && axios.isAxiosError(error) && error.response?.status === 404;
  const isForbidden =
    isError && axios.isAxiosError(error) && error.response?.status === 403;

  if (isNotFound) {
    return <AiDashboardAccessState />;
  }

  if (isForbidden) {
    return <AiDashboardAccessState isForbidden />;
  }

  if (isFetching && !data) {
    return <AiDashboardLoadingState />;
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

  const summary = data ?? undefined;
  const hasAnyData = summary != null;

  return (
    <div>
      <Breadcrumb id="ai" label="AI" url="ai" />
      <Breadcrumb id="ai-dashboard" label={translate('Dashboard')} url="ai" />
      <HeaderContainer
        extra={
          summary && (
            <Link to="/ai/plans" className="btn submit">
              {translate('Add credits')}
            </Link>
          )
        }
      >
        {translate('Dashboard')}
      </HeaderContainer>
      <DashboardWrapper>
        <CardsGrid>
          {summary && (
            <>
              <Card>
                <CardLabel>{translate('Status')}</CardLabel>
                <CardValueSmall>
                  {translate(getSummaryModeLabel(summary))}
                </CardValueSmall>
              </Card>
              {summary.trial_days_remaining != null &&
                summary.mode === 'trial' && (
                  <Card>
                    <CardLabel>{translate('Trial')}</CardLabel>
                    <CardValueSmall>
                      {translate('{days} days left', {
                        days: summary.trial_days_remaining,
                      })}
                    </CardValueSmall>
                  </Card>
                )}
              {summary.plan_name && (
                <Card>
                  <CardLabel>{translate('Plan')}</CardLabel>
                  <CardValueSmall>{summary.plan_name}</CardValueSmall>
                </Card>
              )}
              {(summary.credits_remaining != null ||
                summary.credits_total != null) && (
                <Card>
                  <CardLabel>{translate('Credits remaining')}</CardLabel>
                  <CardValue>
                    {summary.credits_remaining != null
                      ? summary.credits_remaining.toLocaleString()
                      : '—'}
                    {summary.credits_total != null && (
                      <CardValueSmall style={{ marginTop: '0.25rem' }}>
                        {translate('of {total} total', {
                          total: summary.credits_total.toLocaleString(),
                        })}
                      </CardValueSmall>
                    )}
                  </CardValue>
                </Card>
              )}
              {summary.trial_percent_used != null &&
                summary.mode === 'trial' &&
                summary.credits_remaining == null &&
                summary.credits_total == null && (
                  <Card>
                    <CardLabel>{translate('AI credits used')}</CardLabel>
                    <CardValueSmall>
                      {Math.round(summary.trial_percent_used)}%
                    </CardValueSmall>
                  </Card>
                )}
              {summary.created_at && (
                <Card>
                  <CardLabel>{translate('Started')}</CardLabel>
                  <CardValueSmall>
                    {formatAiDate(summary.created_at)}
                  </CardValueSmall>
                </Card>
              )}
            </>
          )}
        </CardsGrid>

        {summary?.daily_metrics && summary.daily_metrics.length > 0 && (
          <Section>
            <SectionTitle>{translate('Requests (last 30 days)')}</SectionTitle>
            <UsageChart>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={summary.daily_metrics}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'credits')
                        return [value.toLocaleString(), translate('Credits')];
                      if (name === 'api_requests')
                        return [value.toString(), translate('Requests')];
                      return [value.toString(), name];
                    }}
                  />
                  <Bar
                    dataKey="credits"
                    fill={colors.blue400}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </UsageChart>
          </Section>
        )}

        {summary?.request_logs && summary.request_logs.length > 0 && (
          <Section>
            <SectionTitle>{translate('Request log')}</SectionTitle>
            <MetricsTable>
              <MetricsTableHead>
                <tr>
                  <MetricsTableHeaderCell>
                    {translate('Date')}
                  </MetricsTableHeaderCell>
                  <MetricsTableHeaderCell>
                    {translate('Status')}
                  </MetricsTableHeaderCell>
                  <MetricsTableHeaderCell>
                    {translate('Credits')}
                  </MetricsTableHeaderCell>
                  <MetricsTableHeaderCell>
                    {translate('Request ID')}
                  </MetricsTableHeaderCell>
                </tr>
              </MetricsTableHead>
              <tbody>
                {summary.request_logs.map((log, idx) => (
                  <MetricsTableRow key={log.request_id ?? idx}>
                    <MetricsTableCell>
                      {log.date ? formatAiDate(log.date) : translate('Unknown')}
                    </MetricsTableCell>
                    <MetricsTableCell>
                      {log.status === 'success'
                        ? translate('Success')
                        : log.status === 'failure'
                          ? translate('Failed')
                          : log.status || '—'}
                    </MetricsTableCell>
                    <MetricsTableCell>
                      {log.credits != null
                        ? `${log.credits.toLocaleString()} ${translate('credits')}`
                        : '—'}
                    </MetricsTableCell>
                    <MetricsTableCell>
                      <code>{log.request_id}</code>
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
                'Usage will appear here once you start using Solspace AI.'
              )}
            </p>
          </EmptyState>
        )}
      </DashboardWrapper>
    </div>
  );
};
