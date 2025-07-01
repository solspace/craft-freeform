import React from 'react';
import type { TestGroup } from '@ff-client/types/form-monitor';
import translate from '@ff-client/utils/translations';
import type { TooltipProps } from 'recharts';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
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

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const dayGroup = groups.find((group) => group.date === dateString);
      const testsForDay = dayGroup?.tests || [];

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

  const uniqueDates = Array.from(new Set(chartData.map((d) => d.date)))
    .sort()
    .reverse();

  const datesToShow = uniqueDates.filter(
    (_, index) => index === 0 || index % 5 === 0
  );

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
    return null;
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
              tickFormatter={(value, index) => {
                const firstIndex = chartData.findIndex((d) => d.date === value);
                if (index === firstIndex && datesToShow.includes(value)) {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                }
                return '';
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, maxDuration * 1.1]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(value) => `${value}s`}
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
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </SubmissionDurationChartContainer>
  );
};
