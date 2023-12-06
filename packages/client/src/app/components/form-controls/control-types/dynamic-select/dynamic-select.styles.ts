import { animations } from '@ff-client/styles/animations';
import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const DropdownContainer = styled.div`
  display: grid;
  grid-template-columns: auto 30px;
  gap: 5px;
`;

export const RefreshButton = styled.button`
  padding: 0;

  background-color: #dfe5ec !important;

  &[disabled] {
    background-color: #eef2f8 !important;

    svg {
      fill: ${colors.gray300};

      animation: ${animations.spinner} 2s infinite;
      transform-origin: 50% 50%;
    }
  }
`;
