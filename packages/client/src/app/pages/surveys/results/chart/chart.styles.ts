import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

type ColorProps = {
  $color: string;
};

export const ChartWrapper = styled.div<ColorProps>`
  position: relative;
`;

export const Title = styled.h1`
  position: absolute;
  top: ${spacings.md};
  left: ${spacings.xl};

  font-size: 40px;
  user-select: none;
  pointer-events: none;
`;

export const ExtraColor = styled.div<ColorProps>`
  margin-top: -3px;
  height: 20px;
  background: linear-gradient(
    to bottom,
    ${({ $color }) => `${$color}1A 30%, transparent 100%`}
  );
`;

export const TooltipWrapper = styled.div<ColorProps>`
  padding: ${spacings.sm} ${spacings.md};
  background-color: white;
  border: 2px solid ${({ $color }) => $color};
`;
