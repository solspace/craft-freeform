import React from 'react';
import translate from '@ff-client/utils/translations';

import type { ChartProps } from '../index.types';

import {
  Answer,
  Bar,
  Container,
  Label,
  Percentage,
  Votes,
  Wrapper,
} from './vertical.styles';

export const Vertical: React.FC<ChartProps> = ({ breakdown }) => {
  return (
    <Container>
      <Wrapper count={breakdown.length}>
        {breakdown.map(({ label, value, votes, percentage, ranking }) => (
          <Answer key={value.toString()}>
            <Percentage>{Math.round(percentage)}%</Percentage>
            <Votes>
              {votes} {translate('resp.')}
            </Votes>
            <Bar percentage={percentage} ranking={ranking} />

            <Label>{label}</Label>
          </Answer>
        ))}
      </Wrapper>
    </Container>
  );
};
