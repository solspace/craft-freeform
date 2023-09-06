import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const DatePickerWrapper = styled.div`
  position: relative;

  .react-datepicker__navigation-icon {
    top: 4px;
  }
`;

export const Icon = styled.div`
  position: absolute;
  left: 150px;
  top: 5px;

  z-index: 2;

  font-size: 16px;
  color: ${colors.gray400};

  user-select: none;
  pointer-events: none;
`;
