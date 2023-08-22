import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

type LabelProps = {
  regular?: boolean;
  required?: boolean;
};

export const Label = styled.label<LabelProps>`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: flex-start;
  color: ${colors.gray550};
  justify-content: flex-start;
  font-weight: ${({ regular }) => (regular ? 'normal' : 'bold')};

  .is-required {
    display: flex;
    margin-top: 0;
    margin-left: 2px;
    flex-direction: row;
    color: ${colors.error};
    align-items: flex-start;
    justify-content: flex-start;
  }
`;

export const Instructions = styled.span`
  display: block;

  color: ${colors.gray300};
  padding-top: 0;
  line-height: 16px;
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
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

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
