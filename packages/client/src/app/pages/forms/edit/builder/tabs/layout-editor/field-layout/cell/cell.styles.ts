import { animated } from 'react-spring';
import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled(animated.div)`
  flex: 1 0;
  overflow: hidden;

  padding: ${spacings.sm} ${spacings.lg};
`;
