import { animated } from 'react-spring';
import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled(animated.div)`
  padding: 0;
  overflow: hidden;
`;

export const Container = styled(animated.div)`
  position: relative;

  padding: ${spacings.md};

  background: ${colors.gray050};
`;
