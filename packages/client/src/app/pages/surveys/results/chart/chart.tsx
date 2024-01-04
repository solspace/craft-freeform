import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import type { ContentType } from 'recharts/types/component/Tooltip';

import { useQuerySurveyChart, useQuerySurveyResults } from '../results.queries';

import {
  ChartWrapper,
  ExtraColor,
  Title,
  TooltipWrapper,
} from './chart.styles';

export const Chart: React.FC = () => {
  const { data: results, isFetching: isFetchingResults } =
    useQuerySurveyResults();
  const { data, isFetching } = useQuerySurveyChart();

  if (isFetching || isFetchingResults) {
    return null;
  }

  const {
    form: { id, name, color },
  } = results;

  const TooltipContent: ContentType<string, number> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const {
        payload: { name, y },
      } = payload[0];

      return (
        <TooltipWrapper $color={color}>
          {name}: <b>{y}</b> submissions
        </TooltipWrapper>
      );
    }
  };

  const maxY = Math.max(...data.map((item) => item.y)) * 2;

  return (
    <ChartWrapper $color={color}>
      <Title>{name}</Title>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart
          data={data}
          margin={{ top: 0, left: 0, right: 0, bottom: 3 }}
        >
          <defs>
            <linearGradient id={`color${id}`} x1={0} y1={0} x2={0} y2={1}>
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={1}
            strokeOpacity={1}
            fillOpacity={1}
            isAnimationActive={false}
            fill={`url(#color${id})`}
          />

          <YAxis domain={[0, maxY]} hide />
          <Tooltip content={<TooltipContent />} />
        </AreaChart>
      </ResponsiveContainer>
      <ExtraColor $color={color} />
    </ChartWrapper>
  );
};
