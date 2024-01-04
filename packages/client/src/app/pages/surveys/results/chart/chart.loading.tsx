import React from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { range } from '@ff-client/utils/arrays';
import translate from '@ff-client/utils/translations';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { ChartWrapper, ExtraColor, Title } from './chart.styles';

const randomSubmissions = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const data = range(0, 60).map((i) => ({
  name: '',
  y: i > 30 ? randomSubmissions(0, Math.random() > 0.5 ? 4 : 1) : 0,
}));

export const ChartLoadingSkeleton: React.FC = () => {
  const color = '#cccccc';

  return (
    <ChartWrapper $color={color}>
      <Title>
        <LoadingText loading instant xl>
          {translate('Loading')}
        </LoadingText>
      </Title>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart
          data={data}
          margin={{ top: 30, left: 0, right: 0, bottom: 3 }}
        >
          <defs>
            <linearGradient id={`color`} x1={0} y1={0} x2={0} y2={1}>
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
            fill={`url(#color)`}
          />
        </AreaChart>
      </ResponsiveContainer>
      <ExtraColor $color={color} />
    </ChartWrapper>
  );
};
