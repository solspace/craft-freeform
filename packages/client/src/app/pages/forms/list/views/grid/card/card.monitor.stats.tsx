import React from 'react';
import type { TestStats } from '@ff-client/types/form-monitor';
import translate from '@ff-client/utils/translations';
import CheckIcon from '@ff-icons/actions/check.svg';
import ExclamationIcon from '@ff-icons/actions/exclamation.svg';
import HourglassIcon from '@ff-icons/actions/hourglass.svg';

import {
  ErrorMessage,
  LastTestStatus,
  LineIndicator,
  MonitorStatus,
  StatsChartContainer,
  TestStatusIcon,
} from './card.monitor.stats.styles';

export type StatusSize = 'sm' | 'lg';
export type StatsAlign = 'left' | 'right';
export type TestStatus = 'success' | 'failed' | 'pending';

const DEFAULT_PROPS = {
  align: 'left' as const,
  width: '70%',
  showLastTest: false,
  size: 'lg' as const,
};

export const getLastTestStatus = (
  stats: TestStats,
  size: StatusSize = DEFAULT_PROPS.size
): React.JSX.Element | null => {
  if (!stats?.lastTest) {
    return (
      <TestStatusIcon $status="pending" $size={size}>
        <HourglassIcon />
      </TestStatusIcon>
    );
  }

  const statusMap: Record<TestStatus, React.JSX.Element> = {
    success: (
      <TestStatusIcon $status="success" $size={size}>
        <CheckIcon />
      </TestStatusIcon>
    ),
    failed: (
      <TestStatusIcon $status="failed" $size={size}>
        <ExclamationIcon />
      </TestStatusIcon>
    ),
    pending: (
      <TestStatusIcon $status="pending" $size={size}>
        <HourglassIcon />
      </TestStatusIcon>
    ),
  };

  return statusMap[stats.lastTest.status as TestStatus] || statusMap.pending;
};

export interface FormMonitorStatsProps {
  formMonitor: TestStats & { enabled: boolean };
  align?: StatsAlign;
  width?: string;
  showLastTest?: boolean;
  size?: StatusSize;
}

export const FormMonitorStats: React.FC<FormMonitorStatsProps> = ({
  formMonitor,
  align = DEFAULT_PROPS.align,
  width = DEFAULT_PROPS.width,
  showLastTest = DEFAULT_PROPS.showLastTest,
  size = DEFAULT_PROPS.size,
}) => {
  if (!formMonitor?.enabled) {
    return null;
  }

  const isPending =
    !formMonitor || !formMonitor.percentage || formMonitor.total === 0;
  const isError = formMonitor?.error;

  if (isError) {
    return (
      <ErrorMessage $withMargin>{formMonitor.error?.message}</ErrorMessage>
    );
  }

  const success = isPending ? 0 : formMonitor.percentage?.success || 0;
  const failed = isPending ? 0 : formMonitor.percentage?.failed || 0;
  const pending = isPending ? 100 : formMonitor.percentage?.pending || 0;

  const progressStyle = {
    '--success': `${success}%`,
    '--failed': `${success + failed}%`,
    '--pending': `${success + failed + pending}%`,
  } as React.CSSProperties;

  return (
    <StatsChartContainer
      $align={align}
      style={isPending ? { marginTop: '10px' } : undefined}
    >
      {showLastTest && formMonitor.lastTest && (
        <LastTestStatus>
          Last Test {getLastTestStatus(formMonitor, size)}
        </LastTestStatus>
      )}
      <LineIndicator $width={width} style={progressStyle} />
      <MonitorStatus>
        {isPending
          ? translate('Uptime: Pending')
          : `${translate('Uptime')}: ${success}%`}
      </MonitorStatus>
    </StatsChartContainer>
  );
};
