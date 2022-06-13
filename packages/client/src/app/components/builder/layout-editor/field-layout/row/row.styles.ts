import { animated } from 'react-spring';
import styled from 'styled-components';

import { BoxShadow } from '@ff-client/styles/variables';

export const Wrapper = styled.div``;

export const Container = styled(BoxShadow)`
  border: 3px dashed red;
  padding: 1px;

  position: relative;

  display: flex;
  justify-content: space-between;
  align-items: stretch;
`;

export const Placeholder = styled(animated.div)`
  overflow: hidden;
  font-size: 0;
  line-height: 0;
`;
