import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import { animated } from 'react-spring';
import styled from 'styled-components';

export const Wrapper = styled(animated.div)`
  padding: 0;
  overflow: hidden;
`;

export const Container = styled(animated.div)`
  position: relative;

  margin: ${spacings.md};
  padding: ${spacings.md};

  background: ${colors.gray050};
  box-shadow: 0 0 0 1px ${colors.gray200}, 0 2px 12px rgb(205 216 228 / 50%);
  border-radius: ${borderRadius.lg};
`;
