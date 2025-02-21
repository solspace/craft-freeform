import React from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@ff-client/app/components/layout/sidebar/sidebar';
import { useFMFormTestsQuery } from '@ff-client/queries/form-monitor';
import translate from '@ff-client/utils/translations';
import FailedIcon from '@ff-icons/actions/failed.svg';
import LoadingIcon from '@ff-icons/actions/loading.svg';
import SuccessIcon from '@ff-icons/actions/success.svg';

import { FormMonitorLoader } from '../form-monitor.loader';

import {
  ChartContainer,
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

export const List: React.FC = () => {
  const { formId } = useParams();
  const { data: formTests, isLoading } = useFMFormTestsQuery(Number(formId));

  if (isLoading) {
    return (
      <Sidebar>
        <FormMonitorLoader />
      </Sidebar>
    );
  }

  if (!formTests) return null;

  const { stats } = formTests;
  const lastTest = formTests?.tests[0];
  const previousTest = formTests?.tests[1];
  const lastTestStatus = lastTest?.status;

  return (
    <Sidebar>
      <Wrapper>
        <MostRecentTests>
          <h3>{translate('Most Recent Test')}</h3>
          {lastTest?.dateAttempted}
          <div className={`status-${lastTestStatus}`}>
            <div className="status-main">
              <div className="icon">
                {lastTestStatus === 'success' && (
                  <SuccessIcon width={48} height={48} />
                )}
                {lastTestStatus === 'failed' && (
                  <FailedIcon width={48} height={48} />
                )}
                {lastTestStatus === 'pending' && (
                  <LoadingIcon width={48} height={48} />
                )}
              </div>
              {translate(getStatusText(lastTestStatus))}
            </div>
            {lastTestStatus === 'pending' && previousTest && (
              <small>
                {translate('Previous Test')}:{' '}
                <span className="icon">
                  {previousTest.status === 'success' && (
                    <SuccessIcon width={16} height={16} />
                  )}
                  {previousTest.status === 'failed' && (
                    <FailedIcon width={16} height={16} />
                  )}
                  {previousTest.status === 'pending' && (
                    <LoadingIcon width={16} height={16} />
                  )}
                </span>{' '}
                <span className="status-text">
                  {translate(
                    previousTest.status.charAt(0).toUpperCase() +
                      previousTest.status.slice(1)
                  )}
                </span>
              </small>
            )}
          </div>
        </MostRecentTests>

        <ChartContainer>
          <StatContainer>
            <h3>{translate('Last 30 Days')}</h3>
            <TotalCount>
              {translate('Total Tests')}: {stats.total}
            </TotalCount>
            <StatRow>
              <StatHeader>
                <StatLabel $type="success">{translate('Success')}</StatLabel>
                <StatValue>
                  {stats.percentage.success}% ({stats.success})
                </StatValue>
              </StatHeader>
              <ProgressBar>
                <Progress
                  $type="success"
                  $percentage={stats.percentage.success}
                />
              </ProgressBar>
            </StatRow>

            <StatRow>
              <StatHeader>
                <StatLabel $type="failed">{translate('Failed')}</StatLabel>
                <StatValue>
                  {stats.percentage.failed}% ({stats.failed})
                </StatValue>
              </StatHeader>
              <ProgressBar>
                <Progress
                  $type="failed"
                  $percentage={stats.percentage.failed}
                />
              </ProgressBar>
            </StatRow>

            <StatRow>
              <StatHeader>
                <StatLabel $type="pending">{translate('Pending')}</StatLabel>
                <StatValue>
                  {stats.percentage.pending}% ({stats.pending})
                </StatValue>
              </StatHeader>
              <ProgressBar>
                <Progress
                  $type="pending"
                  $percentage={stats.percentage.pending}
                />
              </ProgressBar>
            </StatRow>
          </StatContainer>
        </ChartContainer>
      </Wrapper>
    </Sidebar>
  );
};
