import React from 'react';
import { Sidebar } from '@ff-client/app/components/layout/sidebar/sidebar';
import type {
  FormTest,
  FormTestsResponse,
} from '@ff-client/types/form-monitor';
import translate from '@ff-client/utils/translations';
import FailedIcon from '@ff-icons/actions/failed.svg';
import LoadingIcon from '@ff-icons/actions/loading.svg';
import SuccessIcon from '@ff-icons/actions/success.svg';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { FormMonitorLoader } from '../form-monitor.loader';
import { StatusDot, StatusIndicator } from '../monitor.styles';

import {
  ChartContainer,
  ConfigItem,
  ConfigLabel,
  ConfigurationSection,
  ConfigWrapper,
  MainStats,
  MonitoredUrl,
  MostRecentTests,
  Progress,
  ProgressBar,
  StatContainer,
  StatHeader,
  StatLabel,
  StatRow,
  StatValue,
  TotalCount,
  Wrapper,
} from './list.styles';

const getStatusText = (status: string): string => {
  if (status === 'pending') {
    return 'Processing';
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
};

type Configuration = {
  integrationStatus: 'enabled' | 'disabled';
  serviceStatus: 'active' | 'inactive';
  monitoredUrl: string;
};

const ConfigurationPanel: React.FC<{ configuration: Configuration }> = ({
  configuration,
}) => (
  <ConfigurationSection>
    <h3>{translate('Configuration')}</h3>
    <ConfigWrapper>
      <ConfigItem>
        <ConfigLabel>{translate('Integration Status')}</ConfigLabel>
        <StatusIndicator
          $size="sm"
          $status={
            configuration.integrationStatus === 'enabled'
              ? 'success'
              : 'disabled'
          }
        >
          <StatusDot $size="md" />
          {translate(
            configuration.integrationStatus === 'enabled'
              ? 'ENABLED'
              : 'DISABLED'
          )}
        </StatusIndicator>
      </ConfigItem>

      <ConfigItem>
        <ConfigLabel>{translate('Service Status')}</ConfigLabel>
        <StatusIndicator
          $size="sm"
          $status={
            configuration.serviceStatus === 'active'
              ? 'active'
              : configuration.serviceStatus === 'inactive'
                ? 'inactive'
                : 'disabled'
          }
        >
          <StatusDot $size="md" />
          {translate(
            configuration.serviceStatus === 'active'
              ? 'ACTIVE'
              : configuration.serviceStatus === 'inactive'
                ? 'INACTIVE'
                : 'DISABLED'
          )}
        </StatusIndicator>
      </ConfigItem>

      {configuration?.monitoredUrl && (
        <ConfigItem $isColumn>
          <ConfigLabel>{translate('Monitored URL')}</ConfigLabel>
          <MonitoredUrl>{configuration.monitoredUrl}</MonitoredUrl>
        </ConfigItem>
      )}
    </ConfigWrapper>
  </ConfigurationSection>
);

const TestStatusIcon: React.FC<{ status: string; size?: number }> = ({
  status,
  size = 48,
}) => {
  switch (status) {
    case 'success':
      return <SuccessIcon width={size} height={size} />;
    case 'failed':
      return <FailedIcon width={size} height={size} />;
    default:
      return <LoadingIcon width={size} height={size} />;
  }
};

const RecentTestPanel: React.FC<{
  lastTest?: FormTest;
}> = ({ lastTest }) => {
  const lastTestStatus = lastTest?.status;

  if (!lastTestStatus) {
    return null;
  }

  return (
    <MostRecentTests>
      <h3>{translate('Most Recent Test')}</h3>
      <MainStats>
        {lastTest?.dateAttempted}
        <div className={`status-${lastTestStatus}`}>
          <div className="status-main">
            <div className="icon">
              <TestStatusIcon status={lastTestStatus} />
            </div>
            {translate(getStatusText(lastTestStatus))}
          </div>
        </div>
      </MainStats>
    </MostRecentTests>
  );
};

const StatsPanel: React.FC<{ stats: FormTestsResponse['stats'] }> = ({
  stats,
}) => (
  <ChartContainer>
    <StatContainer>
      <h3>{translate('Last 30 Days')}</h3>
      <TotalCount>
        {translate('Total Tests')}: {stats?.total || 0}
      </TotalCount>
      <MainStats>
        {(['success', 'failed'] as const).map((type) => (
          <StatRow key={type}>
            <StatHeader>
              <StatLabel $type={type}>
                {translate(getStatusText(type))}
              </StatLabel>
              <StatValue>
                {stats?.percentage?.[type] || 0}% ({stats?.[type] || 0})
              </StatValue>
            </StatHeader>
            <ProgressBar>
              <Progress
                $type={type}
                $percentage={stats?.percentage?.[type] || 0}
              />
            </ProgressBar>
          </StatRow>
        ))}
      </MainStats>
    </StatContainer>
  </ChartContainer>
);

type ListProps = {
  formTestsQuery: UseQueryResult<FormTestsResponse, AxiosError>;
};

export const List: React.FC<ListProps> = ({ formTestsQuery }) => {
  const { data: formTests, isLoading } = formTestsQuery;

  if (isLoading) {
    return (
      <Sidebar>
        <FormMonitorLoader />
      </Sidebar>
    );
  }

  const configuration = {
    integrationStatus: formTests?.enabled ? 'enabled' : 'disabled',
    serviceStatus: formTests?.fmFormStats?.enabled ? 'active' : 'inactive',
    monitoredUrl: formTests?.url || '',
  } as const;

  const lastTest = formTests?.tests?.[0];

  return (
    <Sidebar>
      <Wrapper>
        {!formTests?.tests?.length ? (
          <>
            <RecentTestPanel />
            <StatsPanel
              stats={{
                total: 0,
                percentage: { success: 0, failed: 0, pending: 0 },
                success: 0,
                failed: 0,
                pending: 0,
              }}
            />
          </>
        ) : (
          <>
            <RecentTestPanel lastTest={lastTest} />
            <StatsPanel stats={formTests.stats} />
          </>
        )}
        <ConfigurationPanel configuration={configuration} />
      </Wrapper>
    </Sidebar>
  );
};
