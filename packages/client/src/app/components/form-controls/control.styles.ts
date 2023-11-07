import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

type LabelProps = {
  $regular?: boolean;
};

export const Label = styled.label<LabelProps>`
  display: block;

  color: ${colors.gray550};
  font-weight: ${({ $regular }) => ($regular ? 'normal' : 'bold')} !important;

  &.is-required {
    &:after {
      content: '*';
      padding-left: 2px;

      color: ${colors.error};
    }
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

  code {
    background-color: #dfe5ec;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
    color: ${colors.gray600};
    font-style: normal;
  }
`;

export const FormField = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  display: block;

  &.disabled {
    user-select: none;
    pointer-events: none;
    opacity: 0.5;
  }
`;

type ControlWrapperProps = {
  $width?: number;
};

export const ControlWrapper = styled.div<ControlWrapperProps>`
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  width: ${({ $width }) => ($width ? `${$width}%` : '100%')};

  &.disabled {
    opacity: 0.5;
    user-select: none;
    pointer-events: none;
  }

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

  &.spacing-small {
    padding-top: 6px;
  }

  .btn {
    background-color: var(--ui-control-bg-color);

    &:hover {
      background-color: var(--ui-control-hover-bg-color);
    }
  }
`;
