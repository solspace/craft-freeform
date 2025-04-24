import React from 'react';
import type { FormWithStats } from '@ff-client/types/forms';
import translate from '@ff-client/utils/translations';
import CheckIcon from '@ff-icons/actions/check.svg';
import ExclamationIcon from '@ff-icons/actions/exclamation.svg';
import HourglassIcon from '@ff-icons/actions/hourglass.svg';

import {
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
  formMonitor: FormWithStats['formMonitor'],
  size: StatusSize = DEFAULT_PROPS.size
): React.JSX.Element | null => {
  if (!formMonitor?.enabled) return null;

  const { stats } = formMonitor;
  if (!stats) {
    return (
      <TestStatusIcon $status="pending" $size={size}>
        <HourglassIcon />
      </TestStatusIcon>
    );
  }

  const { lastTest } = stats;
  if (!lastTest) {
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

  return statusMap[lastTest.status as TestStatus] || statusMap.pending;
};

export interface FormMonitorStatsProps {
  formMonitor: FormWithStats['formMonitor'];
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
  const stats = formMonitor?.stats;
  const isPending = !stats || (stats.total || 0) === 0;

  const success = isPending ? 0 : stats.percentage?.success || 0;
  const failed = isPending ? 0 : stats.percentage?.failed || 0;
  const pending = isPending ? 100 : stats.percentage?.pending || 0;

  const progressStyle = {
    '--success': `${success}%`,
    '--failed': `${success + failed}%`,
    '--pending': `${success + failed + pending}%`,
  } as React.CSSProperties;

  return (
    <StatsChartContainer $align={align}>
      {showLastTest && (
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
