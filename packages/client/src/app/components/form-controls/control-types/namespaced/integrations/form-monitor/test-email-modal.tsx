import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { ThemedSkeleton } from '@components/loaders/skeletons/themed-skeleton';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import { Modal } from '@ff-client/app/components/modals/modal';
import {
  type TestEmailHistoryItem,
  useSendTestEmailMutation,
  useTestEmailHistoryQuery,
  useTestEmailStatusQuery,
} from '@ff-client/queries/form-monitor';
import { spacings } from '@ff-client/styles/variables';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import {
  DescriptionText,
  EmptyState,
  ErrorMessage,
  HistorySection,
  StatusBadge,
  SuccessMessage,
  TestActionSection,
  TestButton,
  TestEmailTable,
  WarningMessage,
} from './test-email-modal.styles';

type Props = {
  formId: number;
  onClose: () => void;
};

export const TestEmailModal: React.FC<Props> = ({ formId, onClose }) => {
  const [currentTestToken, setCurrentTestToken] = useState<string | null>(null);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);
  const [testResultStatus, setTestResultStatus] = useState<
    'success' | 'failed' | null
  >(null);
  const [testResultError, setTestResultError] = useState<string | null>(null);

  const {
    data: historyData,
    isFetching: isLoadingHistory,
    refetch: refetchHistory,
  } = useTestEmailHistoryQuery(formId);

  const [shouldPoll, setShouldPoll] = useState(false);

  const { data: statusData } = useTestEmailStatusQuery(currentTestToken, {
    enabled: !!currentTestToken,
    refetchInterval: shouldPoll ? 3000 : undefined,
  });

  // Update polling state based on status
  useEffect(() => {
    if (currentTestToken && statusData?.status === 'pending') {
      setShouldPoll(true);
    } else {
      setShouldPoll(false);
    }
  }, [currentTestToken, statusData?.status]);

  const sendTestMutation = useSendTestEmailMutation(formId, {
    onSuccess: (data) => {
      setCurrentTestToken(data.testToken);
      setPollingStartTime(Date.now());
    },
    onError: () => {
      setCurrentTestToken(null);
    },
  });

  // Check for timeout (4 minutes) – after that we rely on history updates
  useEffect(() => {
    if (
      pollingStartTime &&
      statusData?.status === 'pending' &&
      Date.now() - pollingStartTime > 240000
    ) {
      // Timeout reached
      setCurrentTestToken(null);
      setPollingStartTime(null);
    }
  }, [pollingStartTime, statusData?.status]);

  useEffect(() => {
    if (statusData?.status === 'success' || statusData?.status === 'failed') {
      setCurrentTestToken(null);
      setPollingStartTime(null);
      setTestResultStatus(statusData.status);
      setTestResultError(statusData.errorMessage || null);
      refetchHistory();
    }
  }, [statusData?.status, statusData?.errorMessage, refetchHistory]);

  const handleTestNow = (): void => {
    setTestResultStatus(null);
    setTestResultError(null);
    sendTestMutation.mutate();
  };

  const getStatusBadgeClass = (
    status: TestEmailHistoryItem['status']
  ): string => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'pending';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const isTestInProgress =
    sendTestMutation.isPending || currentTestToken !== null;
  const isTestComplete = testResultStatus === 'success';

  return (
    <Modal closeModal={onClose}>
      <ModalContainer style={{ maxWidth: '600px' }}>
        <ModalHeader>
          <h1>{translate('Test Email Notifications')}</h1>
        </ModalHeader>

        <div style={{ padding: spacings.xl }}>
          <TestActionSection>
            <DescriptionText>
              {translate(
                "A test email will be sent to 'inbound@test.formmonitor.com' to confirm that your email delivery and inbound processing are functioning correctly."
              )}
            </DescriptionText>

            {testResultStatus !== 'success' && (
              <TestButton
                className={classes(
                  'btn',
                  'submit',
                  (isTestInProgress || isTestComplete) && 'disabled'
                )}
                onClick={handleTestNow}
                disabled={isTestInProgress || isTestComplete}
              >
                {isTestInProgress
                  ? translate('Testing...')
                  : isTestComplete
                    ? translate('Test complete')
                    : translate('Test it now')}
              </TestButton>
            )}

            {testResultStatus === 'success' && (
              <SuccessMessage>
                {translate('Test email received successfully!')}
              </SuccessMessage>
            )}

            {testResultStatus === 'failed' && (
              <ErrorMessage>
                {translate('Test email failed:')}{' '}
                {testResultError || translate('Unknown error')}
              </ErrorMessage>
            )}

            {pollingStartTime && Date.now() - pollingStartTime >= 240000 && (
              <WarningMessage>
                {translate(
                  'Test email is taking longer than expected. Please check again in 10 minutes—the final status will appear in the Test Email History once delivery completes.'
                )}
              </WarningMessage>
            )}
          </TestActionSection>

          <HistorySection>
            <h3>{translate('Test Email History')}</h3>
            {isLoadingHistory ? (
              <ThemedSkeleton>
                <TestEmailTable>
                  <thead>
                    <tr>
                      <th>{translate('ID')}</th>
                      <th>{translate('Status')}</th>
                      <th>{translate('Date & Time')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td>
                          <Skeleton width={40} />
                        </td>
                        <td>
                          <Skeleton width={80} />
                        </td>
                        <td>
                          <Skeleton width={150} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </TestEmailTable>
              </ThemedSkeleton>
            ) : !historyData ||
              !historyData.testEmails ||
              historyData.testEmails.length === 0 ? (
              <EmptyState>{translate('No test emails sent yet.')}</EmptyState>
            ) : (
              <TestEmailTable>
                <thead>
                  <tr>
                    <th>{translate('ID')}</th>
                    <th>{translate('Status')}</th>
                    <th>{translate('Date & Time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.testEmails.map((item) => (
                    <tr key={item.id}>
                      <td className="no-break">{item.id}</td>
                      <td>
                        <StatusBadge
                          className={getStatusBadgeClass(item.status)}
                        >
                          {item.status === 'success'
                            ? translate('Success')
                            : item.status === 'failed'
                              ? translate('Failed')
                              : translate('Pending')}
                        </StatusBadge>
                      </td>
                      <td className="no-break" title={item.createdAt}>
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TestEmailTable>
            )}
          </HistorySection>
        </div>

        <ModalFooter>
          <button className="btn cancel" onClick={onClose}>
            {translate('Close')}
          </button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};
