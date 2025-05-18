import React from 'react';
import { Sidebar } from '@ff-client/app/components/layout/sidebar/sidebar';
import { useFormMonitorEnableMutation } from '@ff-client/queries/form-monitor.mutations';
import type {
  FormTest,
  FormTestsResponse,
} from '@ff-client/types/form-monitor';
import translate from '@ff-client/utils/translations';
import BroomIcon from '@ff-icons/actions/broom.svg';
import EllipsisIcon from '@ff-icons/actions/ellipsis.svg';
import LoadingIcon from '@ff-icons/actions/loading.svg';
import StopIcon from '@ff-icons/actions/stop.svg';
import TrashIcon from '@ff-icons/actions/trash.svg';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import {
  DisableAndDeleteMonitoringModal,
  DisableMonitoringModal,
} from '../form-monitor.disable';
import { FormMonitorLoader } from '../form-monitor.loader';
import { DeleteTestModal } from '../form-monitor.test.delete';
import { StatusDot, StatusIndicator } from '../monitor.styles';

import {
  ActionContainer,
  ConfigItem,
  ConfigLabel,
  ConfigurationSection,
  ConfigWrapper,
  MainStats,
  MenuButton,
  MenuDropdown,
  MenuItem,
  MenuItemWithBorder,
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
  const [showDisableModal, setShowDisableModal] = React.useState(false);
  const [showDisableAndClearModal, setShowDisableAndClearModal] =
    React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

        <ActionContainer ref={menuRef}>
          <MenuButton
            onClick={() => setShowMenu(!showMenu)}
            aria-expanded={showMenu}
            aria-controls="action-menu"
            title={translate('Actions')}
          >
            <EllipsisIcon />
          </MenuButton>
          {showMenu && (
            <MenuDropdown id="action-menu">
              {hasTests && (
                <MenuItem
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                >
                  <BroomIcon />
                  {translate('Clear All Test History')}
                </MenuItem>
              )}
              {configuration.serviceStatus !== 'inactive' && (
                <>
                  <MenuItem
                    onClick={() => {
                      setShowMenu(false);
                      setShowDisableModal(true);
                    }}
                  >
                    <StopIcon />
                    {translate('Disable Monitoring')}
                  </MenuItem>
                  {hasTests && (
                    <MenuItemWithBorder
                      onClick={() => {
                        setShowMenu(false);
                        setShowDisableAndClearModal(true);
                      }}
                    >
                      <TrashIcon />
                      {translate('Disable & Delete Monitoring Data')}
                    </MenuItemWithBorder>
                  )}
                </>
              )}
            </MenuDropdown>
          )}
        </ActionContainer>
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
      {showDisableModal && (
        <DisableMonitoringModal
          formId={configuration.formId}
          onClose={() => setShowDisableModal(false)}
          onSuccess={() => {
            setShowDisableModal(false);
            refetchData();
          }}
        />
      )}
      {showDisableAndClearModal && (
        <DisableAndDeleteMonitoringModal
          formId={configuration.formId}
          onClose={() => setShowDisableAndClearModal(false)}
          onSuccess={() => {
            setShowDisableAndClearModal(false);
            refetchData();
          }}
        />
      )}
    </ConfigurationSection>
  );
};

const RecentTestPanel: React.FC<{
  lastTest?: FormTest;
}> = ({ lastTest }) => {
  const lastTestStatus = lastTest?.totalStatus;

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
            <StatusIndicator $status={lastTestStatus} $size="xl">
              <StatusDot $size="xl" $status={lastTestStatus}>
                {lastTestStatus === 'pending' && <LoadingIcon />}
              </StatusDot>
              {translate(getStatusText(lastTestStatus))}
            </StatusIndicator>
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
        {nextMonitoringTime} <br /> (in {nextMonitoringTimeIn?.humanReadable})
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
