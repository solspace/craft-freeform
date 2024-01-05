import React from 'react';

import type { ChartProps } from '../index.types';

import { Item, Wrapper } from './text.styles';

export const Text: React.FC<ChartProps> = ({ breakdown }) => {
  return (
    <Wrapper>
      {breakdown.map((item) => (
        <Item key={item.value.toString()}>
          {item.label}
          {item.votes > 1 && ` (${item.votes})`}
        </Item>
      ))}
    </Wrapper>
  );
};
