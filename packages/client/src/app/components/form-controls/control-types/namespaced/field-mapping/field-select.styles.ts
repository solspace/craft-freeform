import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const DropDown = styled.select`
  font-size: 13px !important;

  &.empty {
    color: ${colors.gray300} !important;
  }
`;
