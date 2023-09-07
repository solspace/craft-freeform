import styled from 'styled-components';

import { easings } from '@ff-welcome-screen/shared/styles/animations';

export const Wrapper = styled.div`
  position: relative;

  display: flex;
  margin: 20px 0;
`;

interface DotProps {
  $position?: number;
}

const radius = 6;
export const Dot = styled.div<DotProps>`
  width: ${radius}px;
  height: ${radius}px;

  margin: 0 10px;

  border: 1px solid transparent;
  border-radius: 5px;

  background: #e8ebee;
`;

export const ActiveDot = styled(Dot)`
  position: absolute;

  background: #909caf;

  transition: all 200ms ${easings.out.quart};
  left: ${({ $position }): number => $position * 26}px;
`;
