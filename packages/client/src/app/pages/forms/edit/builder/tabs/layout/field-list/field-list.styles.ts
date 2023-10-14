import { animated } from 'react-spring';
import { scrollBar } from '@ff-client/styles/mixins';
import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { Wrapper } from './field-group/field/field.styles';

export const FieldListWrapper = styled(animated.div)`
  position: relative;
  padding: ${spacings.lg};

  overflow-y: auto;
  overflow-x: hidden;

  height: 100%;
  ${scrollBar};

  &.fields-disabled {
    ${Wrapper} {
      opacity: 0.5;
      user-select: none;
      pointer-events: none;
    }
  }
`;
