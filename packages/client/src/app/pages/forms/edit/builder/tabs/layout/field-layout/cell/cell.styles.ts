import { animated } from 'react-spring';
import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const CellWrapper = styled(animated.div)`
  overflow: hidden;
  padding: ${spacings.sm} ${spacings.lg};

  &,
  * {
    cursor: pointer;
  }
`;
