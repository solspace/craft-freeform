import { animated } from 'react-spring';
import styled from 'styled-components';

export const ImportWrapper = styled.div`
  display: flex;
`;

export const ProgressWrapper = styled(animated.div)`
  transform-origin: center top;
`;
