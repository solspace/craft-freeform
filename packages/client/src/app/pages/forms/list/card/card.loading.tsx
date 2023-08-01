import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import {
  CardBody,
  CardWrapper,
  LinkList,
  PaddedChartFooter,
} from './card.styles';

const randomSubmissions = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const CardLoading: React.FC = () => {
  const color = '#dfdfdf';

  const data = Array.from({ length: 10 }, () => ({
    value: randomSubmissions(0, Math.random() > 0.9 ? 8 : 4),
  }));

  return (
    <CardWrapper>
      <CardBody>
        <Skeleton height={20} width="50%" />
        <Skeleton height={10} width="80%" />

        <LinkList>
          <li>
            <Skeleton height={8} width={90} />
          </li>
          <li>
            <Skeleton height={8} width={50} />
          </li>
        </LinkList>
      </CardBody>

      <ResponsiveContainer width="100%" height={40}>
        <AreaChart
          data={data}
          margin={{ top: 2, bottom: 3, left: 0, right: 0 }}
        >
          <Area
            type="monotone"
            dataKey={'value'}
            stroke={color}
            strokeWidth={2.3}
            fillOpacity={0.3}
            fill={color}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <PaddedChartFooter $color={color} />
    </CardWrapper>
  );
};
