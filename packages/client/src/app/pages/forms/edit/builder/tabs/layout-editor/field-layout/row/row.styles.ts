import { spacings } from '@ff-client/styles/variables';
import { animated } from 'react-spring';
import styled from 'styled-components';

export const Wrapper = styled.div``;

export const Container = styled.div`
  //border: 3px dashed red;

  position: relative;

  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: ${spacings.lg};
`;

export const Placeholder = styled(animated.div)`
  overflow: hidden;
  font-size: 0;
  line-height: 0;

  border: 3px dashed red;
`;
