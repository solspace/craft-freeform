import React from 'react';
import type { TestGroup } from '@ff-client/types/form-monitor';
import translate from '@ff-client/utils/translations';
import type { TooltipProps } from 'recharts';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { StatusDot, StatusIndicator } from '../monitor.styles';

import {
  ChartTestTooltip,
  ChartTestTooltipContent,
  ChartTestTooltipHeader,
  ChartWrapper,
  SubmissionDurationChartContainer,
} from './results.styles';

type SubmissionDurationChartProps = {
  groups: TestGroup[];
};

export const SubmissionDurationChart: React.FC<
  SubmissionDurationChartProps
> = ({ groups }) => {
  // Create data for all 30 days, with individual test points
  const generateChartData = (): Array<{
    date: string;
    duration: number;
    testId: number | null;
    status: string;
    dateAttempted: string;
  }> => {
    const today = new Date();
    const chartData: Array<{
      date: string;
      duration: number;
      testId: number | null;
      status: string;
      dateAttempted: string;
    }> = [];

    // Generate 30 days of data (recent days on the left)
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i); // This makes recent days appear first
      const dateString = date.toISOString().split('T')[0];

      // Find tests for this date
      const dayGroup = groups.find((group) => group.date === dateString);
      const testsForDay = dayGroup?.tests || [];

      // Add individual test points for this day
      testsForDay.forEach((test) => {
        if (
          test.submissionDuration !== undefined &&
          test.submissionDuration !== null
        ) {
          chartData.push({
            date: dateString,
            duration: test.submissionDuration,
            testId: test.id || 0,
            status: test.status?.toLowerCase() || 'pending',
            dateAttempted: test.dateAttempted || '',
          });
        }
      });

      // If no tests for this day, add a zero point to maintain the line
      if (testsForDay.length === 0) {
        chartData.push({
          date: dateString,
          duration: 0,
          testId: null,
          status: 'no-tests',
          dateAttempted: '',
        });
      }
    }

    return chartData;
  };

  const chartData = generateChartData();
  const allTestData = chartData.filter((d) => d.status !== 'no-tests');

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>): React.JSX.Element | null => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;

      if (dataPoint.status === 'no-tests') {
        return (
          <ChartTestTooltip>
            <ChartTestTooltipContent>
              <div>{label}</div>
              <div>No tests on this day</div>
            </ChartTestTooltipContent>
          </ChartTestTooltip>
        );
      }

      return (
        <ChartTestTooltip>
          <ChartTestTooltipHeader>
            <StatusIndicator $status={dataPoint.status} $size="sm">
              <StatusDot $size="md" />
              {translate(dataPoint.status?.toUpperCase())}
            </StatusIndicator>
          </ChartTestTooltipHeader>
          <ChartTestTooltipContent>
            <div className="test-id">Test: {dataPoint.testId}</div>
            <div className="test-date">{dataPoint.dateAttempted}</div>
            <div className="test-duration">
              Submit time: <strong>{dataPoint.duration}s</strong>
            </div>
          </ChartTestTooltipContent>
        </ChartTestTooltip>
      );
    }
    return null;
  };

  const maxDuration = Math.max(...chartData.map((d) => d.duration), 0.1);
  const hasData = chartData.some((d) => d.duration >= 0);

  if (!hasData) {
    return null; // Don't render the component at all if no data
  }

  return (
    <SubmissionDurationChartContainer>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, maxDuration * 1.1]}
              tickFormatter={(value) => `${value.toFixed(2)}s`}
              label={{
                value: translate('Submit Time'),
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' },
              }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="duration"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#durationGradient)"
              isAnimationActive={false}
              connectNulls={true}
            />
            {/* Render each test point individually with explicit styling */}
            {allTestData.map((testPoint, index) => (
              <Scatter
                key={`test-${testPoint.testId}-${index}`}
                data={[testPoint]}
                dataKey="duration"
                fill={
                  testPoint.status === 'success'
                    ? '#10b981'
                    : testPoint.status === 'failed'
                      ? '#ef4444'
                      : '#6b7280'
                }
                shape="circle"
                r={testPoint.status === 'failed' ? 8 : 4}
                stroke={testPoint.status === 'failed' ? '#dc2626' : 'none'}
                strokeWidth={testPoint.status === 'failed' ? 2 : 0}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </SubmissionDurationChartContainer>
  );
};
