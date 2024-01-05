import React from 'react';
import { generateColor } from '@ff-client/utils/colors';
import { interpolateTurbo as colorScale } from 'd3-scale-chromatic';
import type { PieLabel } from 'recharts';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import type { ChartProps } from './index.types';

const RADIAN = Math.PI / 180;

type Props = ChartProps & {
  pie?: boolean;
};

export const Donut: React.FC<Props> = ({ breakdown, pie }) => {
  const filtered = breakdown.filter(({ votes }) => votes > 0);
  const backgroundColor = breakdown.map(({ ranking }) =>
    generateColor(ranking / breakdown.length, colorScale)
  );

  const renderCustomizedLabel: PieLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        key={index}
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        <tspan style={{ fontWeight: 'bold' }}>{filtered[index].label}</tspan>
        <tspan
          style={{
            fontSize: '12px',
            fill: '#999',
          }}
        >
          {' '}
          ({`${(percent * 100).toFixed(0)}%`})
        </tspan>
      </text>
    );
  };

  return (
    <div style={{ width: 800 }}>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={filtered}
            dataKey={'votes'}
            nameKey={'label'}
            cx="50%"
            cy="50%"
            outerRadius={180}
            innerRadius={pie ? 0 : 100}
            fill="#82ca9d"
            labelLine
            label={renderCustomizedLabel}
          >
            {filtered.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={backgroundColor[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
