import React from 'react';
import { Sidebar } from '@ff-client/app/components/layout/sidebar/sidebar';
import { useFormMonitorEnableMutation } from '@ff-client/queries/form-monitor.mutations';
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
import { DeleteTestModal } from '../form-monitor.test.delete';
import { StatusDot, StatusIndicator } from '../monitor.styles';

import {
  ClearAllButton,
  ConfigItem,
  ConfigLabel,
  ConfigurationSection,
  ConfigWrapper,
  MainStats,
  MonitoredUrl,
  MostRecentTests,
  NextScheduledTestContainer,
  ReactivateButton,
  StatusContainer,
  StatusMessage,
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
  formId: number;
};

const ConfigurationPanel: React.FC<{
  configuration: Configuration;
  refetchData: () => void;
  hasTests?: boolean;
}> = ({ configuration, refetchData, hasTests }) => {
  const [reactivationStatus, setReactivationStatus] = React.useState<
    string | null
  >(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const reactivateMutation = useFormMonitorEnableMutation(
    configuration.formId,
    {
      onLoading: () => {
        setReactivationStatus('loading');
      },
      onSuccess: () => {
        setReactivationStatus('success');
        setTimeout(() => {
          setReactivationStatus(null);
          refetchData();
        }, 2000);
      },
      onError: () => {
        setReactivationStatus('error');
        setTimeout(() => {
          setReactivationStatus(null);
        }, 2000);
      },
    }
  );

  const handleReactivate = (): void => {
    reactivateMutation.mutate();
  };

  const getStatusMessage = (): string | null => {
    if (reactivationStatus === 'loading') {
      return translate('Reactivating service...');
    } else if (reactivationStatus === 'error') {
      return translate('Reactivation unsuccessful.');
    } else if (reactivationStatus === 'success') {
      return translate('Service reactivated!');
    }
    return null;
  };

  return (
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
          <StatusContainer>
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

            {configuration.serviceStatus === 'inactive' &&
              configuration.integrationStatus === 'enabled' && (
                <>
                  {reactivationStatus ? (
                    <StatusMessage $error={reactivationStatus === 'error'}>
                      {getStatusMessage()}
                    </StatusMessage>
                  ) : (
                    <ReactivateButton
                      onClick={handleReactivate}
                      disabled={reactivateMutation.isLoading}
                    >
                      {translate('Reactivate')}
                    </ReactivateButton>
                  )}
                </>
              )}
          </StatusContainer>
        </ConfigItem>

        {configuration?.monitoredUrl && (
          <ConfigItem $isColumn>
            <ConfigLabel>{translate('Monitored URL')}</ConfigLabel>
            <MonitoredUrl>{configuration.monitoredUrl}</MonitoredUrl>
          </ConfigItem>
        )}

        {hasTests && (
          <ConfigItem>
            <ClearAllButton onClick={() => setShowDeleteModal(true)}>
              {translate('Clear All Test History')}
            </ClearAllButton>
          </ConfigItem>
        )}
      </ConfigWrapper>

      {showDeleteModal && (
        <DeleteTestModal
          formId={configuration.formId}
          testId={0}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            setShowDeleteModal(false);
            refetchData();
          }}
        />
      )}
    </ConfigurationSection>
  );
};

const TestStatusIcon: React.FC<{ status: string; size?: number }> = ({
  status,
  size = 40,
}) => {
  switch (status) {
    case 'success':
      return <SuccessIcon width={48} height={48} />;
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

const NextScheduledTestPanel: React.FC<{
  nextMonitoringTime?: string;
  nextMonitoringTimeIn?: {
    humanReadable: string;
    minutes: number;
    hours: number;
    remainingMinutes: number;
  };
}> = ({ nextMonitoringTime, nextMonitoringTimeIn }) => {
  if (!nextMonitoringTimeIn) {
    return null;
  }

  return (
    <NextScheduledTestContainer>
      <h3>{translate('Next Scheduled Test')}</h3>
      <div className="next-test-time">
        {nextMonitoringTime} (in {nextMonitoringTimeIn?.humanReadable})
      </div>
    </NextScheduledTestContainer>
  );
};

type ListProps = {
  formTestsQuery: UseQueryResult<FormTestsResponse, AxiosError>;
};

export const List: React.FC<ListProps> = ({ formTestsQuery }) => {
  const { data: formTests, isLoading, refetch } = formTestsQuery;

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
    formId: formTests?.formId,
  } as Configuration;

  const hasTests = formTests?.stats?.total > 0;

  return (
    <Sidebar>
      <Wrapper>
        {!hasTests ? (
          <>
            <RecentTestPanel />
          </>
        ) : (
          <>
            <RecentTestPanel lastTest={formTests?.lastSubmission} />
            {formTests?.lastSubmission?.status !== 'pending' && (
              <NextScheduledTestPanel
                nextMonitoringTime={formTests?.fmFormStats?.nextMonitoringTime}
                nextMonitoringTimeIn={
                  formTests?.fmFormStats?.nextMonitoringTimeIn
                }
              />
            )}
          </>
        )}
        <ConfigurationPanel
          configuration={configuration}
          refetchData={refetch}
          hasTests={hasTests}
        />
      </Wrapper>
    </Sidebar>
  );
};
