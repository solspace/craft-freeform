import { animated } from 'react-spring';
import styled from 'styled-components';

export const CellWrapper = styled(animated.div)`
  flex: 1;
  overflow: hidden;

  &,
  * {
    cursor: pointer;
  }
`;
