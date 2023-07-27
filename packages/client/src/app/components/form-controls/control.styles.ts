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

  color: ${colors.gray300};
  padding-top: 6px;
  line-height: 18px;
  font-size: 12px;
  font-style: italic;

  &:not(:last-child) {
    padding-bottom: 6px;
  }
`;

export const FormField = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  display: block;
`;

export const ControlWrapper = styled.div`
  position: relative;

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

      select {
        background-color: var(--ui-control-bg-color);

        &:hover {
          background-color: var(--ui-control-hover-bg-color);
        }
      }
    }
  }
`;
