import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

type LabelProps = {
  regular?: boolean;
  required?: boolean;
};

export const Label = styled.label<LabelProps>`
  display: block;

  color: ${colors.gray550};
  font-weight: ${({ regular }) => (regular ? 'normal' : 'bold')};
`;

export const Instructions = styled.span`
  display: block;
  margin: 5px 0 10px;

  color: ${colors.gray550};
`;

export const FormField = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  display: block;
`;

export const ControlWrapper = styled.div`
  &.errors {
    ${Label} {
      color: ${colors.error};
    }

    ${FormField} {
      input,
      textarea,
      select {
        border: 1px solid ${colors.error};
      }
    }
  }
`;
