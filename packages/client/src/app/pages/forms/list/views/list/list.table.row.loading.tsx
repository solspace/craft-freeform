import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

const randomSubmissions = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const ListTableRowLoading: React.FC = () => {
  const color = '#dfdfdf';
  const data = Array.from({ length: 10 }, () => ({
    value: randomSubmissions(0, Math.random() > 0.9 ? 8 : 4),
  }));

  return (
    <tr>
      <td>
        <Skeleton height={20} width={150} />
      </td>
      <td>
        <Skeleton height={20} width={80} />
      </td>
      <td>
        <Skeleton height={20} width={300} />
      </td>
      <td>
        <ResponsiveContainer width={200} height={20}>
          <AreaChart
            data={data}
            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
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
              fillOpacity={0.7}
              fill={`url(#colorGradient)`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </td>
      <td>
        <Skeleton height={20} width={40} highlightColor="#5372b64f" />
      </td>
      <td>
        <Skeleton height={20} width={20} highlightColor="#5372b64f" />
      </td>
      <td>
        <Skeleton height={20} width={61} />
      </td>
    </tr>
  );
};
