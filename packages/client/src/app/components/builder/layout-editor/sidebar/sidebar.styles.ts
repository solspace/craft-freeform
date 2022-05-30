import { animated } from 'react-spring';
import styled from 'styled-components';

export const Wrapper = styled(animated.div)`
  padding: 0;
  overflow: hidden;
`;

export const Container = styled(animated.div)`
  position: relative;

  margin: var(--m);
  padding: var(--m);

  background: #f3f7fc;
  box-shadow: 0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%);
  border-radius: var(--large-border-radius);
`;
