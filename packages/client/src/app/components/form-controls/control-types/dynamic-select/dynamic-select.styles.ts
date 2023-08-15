import { animations } from '@ff-client/styles/animations';
import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const RefreshButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;

  font-size: 16px;

  &[disabled] > svg {
    fill: ${colors.gray300};

    animation: ${animations.spinner} 2s infinite;
    transform-origin: 50% 50%;
  }
`;
