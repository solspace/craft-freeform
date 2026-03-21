import React from 'react';
import { colors } from '@ff-client/styles/variables';
import translate from '@ff-client/utils/translations';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Section, SectionTitle, UsageChart } from './ai.dashboard.styles';
import type { DailyMetric } from './ai.types';

type Props = {
  metrics: DailyMetric[];
};

const AiUsageChart: React.FC<Props> = ({ metrics }) => {
  if (!metrics.length) return null;

  return (
    <Section>
      <SectionTitle>{translate('Requests (last 30 days)')}</SectionTitle>
      <UsageChart>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={metrics}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <YAxis />
            <RechartsTooltip
              formatter={(value: number, name: string) => {
                if (name === 'credits') {
                  return [value.toLocaleString(), translate('Credits')];
                }
                if (name === 'api_requests') {
                  return [value.toString(), translate('Requests')];
                }
                return [value.toString(), name];
              }}
            />
            <Bar
              dataKey="credits"
              fill={colors.blue400}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </UsageChart>
    </Section>
  );
};

export default AiUsageChart;
