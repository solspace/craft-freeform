import { animated } from 'react-spring';
import styled from 'styled-components';

export const CellWrapper = styled(animated.div)`
  position: relative;
  overflow: hidden;

  &,
  * {
    cursor: pointer;
  }
`;
