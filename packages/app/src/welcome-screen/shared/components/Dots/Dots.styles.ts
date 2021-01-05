import { easings } from '@ff-welcome-screen/shared/styles/animations';
import styled from 'styled-components';

export const Wrapper = styled.div`
  position: relative;

  display: flex;
  margin: 20px 0;
`;

const radius = 6;
export const Dot = styled.div`
  width: ${radius}px;
  height: ${radius}px;

  margin: 0 10px;

  border: 1px solid transparent;
  border-radius: 5px;

  background: #e8ebee;
`;

interface ActiveProps {
  position: number;
}

export const ActiveDot = styled(Dot)`
  position: absolute;

  background: #909caf;

  transition: all 200ms ${easings.out.quart};
  left: ${({ position }: ActiveProps): number => position * 28}px;
`;
