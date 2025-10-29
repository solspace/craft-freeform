import React from 'react';
import { NavLink } from 'react-router-dom';
import type { TestStats } from '@ff-client/types/form-monitor';
import translate from '@ff-client/utils/translations';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { FormMonitorStats } from './card.monitor.stats';
import {
  CardBody,
  CardWrapper,
  ChartWrapper,
  FMContainer,
  FormBody,
  FormBodyContent,
  LinkList,
  PaddedChartFooter,
  TitleLink,
} from './card.styles';

const randomSubmissions = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const titles = [
  'FM Form',
  'Demo FM Form',
  'Test FM Form',
  'Sample FM Form',
  'Contact Us',
  'Feedback Form',
  'Survey Form',
  'Registration Form',
  'Application Form',
  'Subscription Form',
];

export const CardPreview: React.FC = () => {
  const color = '#dfdfdf';

  const data = Array.from({ length: 10 }, () => ({
    value: randomSubmissions(0, Math.random() > 0.9 ? 8 : 4),
  }));

  const total = Math.round(Math.random() * 10) + 1;
  const success = Math.round(total * (Math.random() * 0.8 + 0.6));
  const failed = Math.round(total * (Math.random() * 0.1));
  const title = titles[Math.floor(Math.random() * titles.length)];

  const stats: TestStats = {
    success: success,
    pending: 0,
    percentage: {
      success: Math.round((success / total) * 100),
      pending: 0,
      failed: Math.round((failed / total) * 100),
    },
    failed,
    total,
  };

  return (
    <CardWrapper className="blurred">
      <CardBody>
        <FormBody>
          <FormBodyContent>
            <TitleLink>{title}</TitleLink>

            <LinkList>
              <li>
                <a href="#">3 {translate('Submissions')}</a>
              </li>
              <li>
                <a href="#">0 {translate('Spam')}</a>
              </li>
            </LinkList>
          </FormBodyContent>

          <FMContainer>
            <NavLink to="#">
              <FormMonitorStats
                formMonitor={{
                  ...stats,
                  enabled: true,
                }}
                align="right"
                width="100%"
                showLastTest
                size="sm"
              />
            </NavLink>
          </FMContainer>
        </FormBody>
      </CardBody>

      <ChartWrapper>
        <ResponsiveContainer width="100%" height={40}>
          <AreaChart
            data={data}
            margin={{ top: 10, bottom: 3, left: 0, right: 0 }}
          >
            <defs>
              <linearGradient id={`colorGradient`} x1={0} y1={0} x2={0} y2={1}>
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={'value'}
              stroke={color}
              strokeWidth={1}
              strokeOpacity={1}
              fillOpacity={1}
              fill={`url(#colorGradient)`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <PaddedChartFooter $color={color} />
      </ChartWrapper>
    </CardWrapper>
  );
};
