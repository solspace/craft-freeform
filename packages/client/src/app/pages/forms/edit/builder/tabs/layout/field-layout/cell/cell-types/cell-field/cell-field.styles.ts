import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const CellFieldWrapper = styled.div`
  &.errors {
    color: ${colors.error};

    input,
    textarea,
    select {
      border-color: ${colors.error};
    }
  }
`;

export const Label = styled.label``;
