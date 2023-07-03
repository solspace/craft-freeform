import { animated } from 'react-spring';
import styled from 'styled-components';

export const CellWrapper = styled(animated.div)`
  overflow: hidden;

  &,
  * {
    cursor: pointer;
  }
`;
