import { scrollBar } from '@ff-client/styles/mixins';
import styled from 'styled-components';

type WrapperProps = {
  count: number;
};

export const Container = styled.div`
  width: 900px;
  overflow-x: auto;

  ${scrollBar};
`;

export const Wrapper = styled.div<WrapperProps>`
  display: grid;
  gap: 10px;
  grid-auto-columns: minmax(80px, 1fr);
  grid-auto-flow: column;
`;

export const Answer = styled.div`
  display: flex;
  flex-direction: column;

  text-align: center;
`;

export const Label = styled.div`
  padding: 10px;

  font-size: 16px;
  font-weight: bold;
`;

export const Percentage = styled.div`
  flex-basis: 40px;
  padding: 10px;

  font-weight: bold;
  font-size: 16px;

  box-sizing: border-box;
`;

export const Votes = styled.div`
  flex-basis: 30px;

  color: #c2c5c7;

  font-size: 12px;
  line-height: 12px;

  span {
    display: block;
  }
`;

type BarProps = {
  percentage: number;
  ranking: number;
};

export const Bar = styled.div<BarProps>`
  position: relative;
  overflow: hidden;

  flex-basis: 250px;

  border-radius: 3px;
  background: #f3f7fd;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;

    display: block;

    width: 100%;
    height: ${({ percentage }) => percentage}%;

    background: ${({ ranking }) =>
      ranking === 1 ? 'var(--highlight)' : '#33414d'};
  }
`;
