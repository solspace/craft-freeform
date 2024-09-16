import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { ContentContainer } from '@components/layout/blocks/content-container';

import { ChartLoadingSkeleton } from './chart/chart.loading';
import { Heading, Wrapper } from './result-list/result-list.styles';
import { ResultsWrapper } from './results.styles';

export const ResultsLoadingSkeleton: React.FC = () => {
  return (
    <ContentContainer style={{ padding: 0 }}>
      <ChartLoadingSkeleton />
      <ResultsWrapper>
        <Wrapper>
          <Heading>
            <Skeleton width={300} inline />
            <small>
              <Skeleton width={100} />
            </small>
          </Heading>
        </Wrapper>
      </ResultsWrapper>
    </ContentContainer>
  );
};
