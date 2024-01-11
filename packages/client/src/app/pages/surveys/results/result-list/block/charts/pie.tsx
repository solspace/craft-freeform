import React from 'react';

import { Donut } from './donut';
import type { ChartProps } from './index.types';

export const Pie: React.FC<ChartProps> = ({ breakdown }) => {
  return <Donut breakdown={breakdown} pie />;
};
