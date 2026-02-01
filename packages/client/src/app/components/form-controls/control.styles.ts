import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { Label } from './label.styles';

export const Instructions = styled.span`
  display: block;

  color: ${colors.gray300};
  padding-top: 0;
  line-height: 16px;
  font-size: 12px;
  font-style: italic;
  margin: ${spacings.xs} 0;

  &:not(:last-child) {
    padding-bottom: 6px;
  }

  code {
    padding: 1px 4px;
    border-radius: 3px;
    background-color: #dfe5ec;

    font-family: monospace;
    font-style: normal;
    color: ${colors.gray600};
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

  &.upsell {
    > * {
      user-select: none;
      pointer-events: none;
      filter: blur(1.3px);
    }

    &:before {
      content: attr(data-upsell);

      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 1;
      transform: translate(-50%, -50%);

      padding: ${spacings.md} ${spacings.xl};

      border: 2px solid ${colors.blue400};
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 6px rgba(31, 41, 51, 0.2);

      font-size: 14px;
      text-align: center;
      color: ${colors.gray700};
    }

    &.size-small:before {
      font-size: 12px;
      left: auto;
      right: 0;
      transform: translate(0, -50%);

      padding: ${spacings.xs} ${spacings.xs};
      width: 120px;
  }

  &.spacing-small {
    padding-top: 6px;
  }

  ::placeholder {
    color: ${colors.gray200};
    font-style: italic;
  }

  .btn {
    background-color: var(--ui-control-bg-color);

    &:hover {
      background-color: var(--ui-control-hover-bg-color);
    }
  }
`;

export const LabelGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacings.sm};

  width: 100%;
`;

export const LabelInstructionsWrapper = styled.div`
  flex: 1;
`;

export const ExtraContent = styled.div``;
