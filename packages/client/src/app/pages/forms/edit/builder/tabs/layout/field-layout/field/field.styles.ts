import { animated } from 'react-spring';
import { RemoveButtonWrapper } from '@components/elements/remove-button/remove.styles';
import styled from 'styled-components';

export const FieldWrapper = styled(animated.div)`
  position: relative;

  &,
  * {
    cursor: pointer;
  }

  ${RemoveButtonWrapper} {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 2;
  }
`;
