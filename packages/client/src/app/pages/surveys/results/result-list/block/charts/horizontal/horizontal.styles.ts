import styled from 'styled-components';

export const Answer = styled.div`
  display: grid;
  gap: 2px;
  grid-template-columns: auto 100px 50px;
  grid-template-rows: auto auto;
  grid-template-areas:
    'label votes percentage'
    'graph graph graph';

  &:not(:last-child) {
    margin-bottom: 10px;
  }
`;

export const Label = styled.div`
  grid-area: label;

  font-weight: bold;
`;

export const Percentage = styled.div`
  grid-area: percentage;

  font-size: 14px;
  font-weight: bold;
  text-align: right;
`;

export const Votes = styled.div`
  grid-area: votes;

  color: #c2c5c7;
  font-size: 12px;
  text-align: right;
`;

type BarProps = {
  percentage: number;
  ranking: number;
};

export const Bar = styled.div<BarProps>`
  grid-area: graph;

  position: relative;
  overflow: hidden;

  height: 20px;

  border-radius: 3px;
  background: #f3f7fd;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;

    display: block;

    width: ${({ percentage }) => percentage}%;
    height: 100%;

    background: ${({ ranking }) =>
      ranking === 1 ? 'var(--highlight)' : '#33414d'};
  }
`;
