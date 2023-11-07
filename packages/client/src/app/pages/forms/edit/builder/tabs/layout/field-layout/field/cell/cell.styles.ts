import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacings.xs};

  height: 18px;
  margin-bottom: 4px;
  font-weight: bold;
  color: ${colors.gray550};

  .required {
    position: relative;
    top: -5px;
    left: -5px;
  }
`;

const iconSize = 16;
export const LabelIcon = styled.div`
  position: relative;
  top: -1px;
  &,
  svg {
    width: ${iconSize}px;
    height: ${iconSize}px;
    font-size: ${iconSize}px;
  }
`;

export const Instructions = styled.div`
  margin-top: -4px;
  margin-bottom: 4px;

  color: ${colors.gray300};
  font-style: italic;
  font-size: 12px;
`;

export const FieldCellWrapper = styled.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  padding: ${spacings.sm} ${spacings.md};
  margin: 0;

  border: 1px solid transparent;
  border-radius: ${borderRadius.md};

  transition:
    border-color 0.2s ease-out,
    background-color 0.2s ease-out;

  &.active {
    border: 1px dashed #5782ef;
  }

  &:hover {
    background: #f3f7fd;

    &:not(.active) {
      border: 1px solid #cdd8e4;
    }
  }

  &.errors {
    &,
    label {
      color: ${colors.error};
    }

    input,
    textarea,
    div.select,
    select {
      border-color: ${colors.error} !important;
    }

    div.select {
      border: 1px solid;
    }

    input.checkbox ~ label:before {
      border-color: ${colors.error};
    }
  }

  input:not([type='checkbox']):not([type='radio']),
  textarea,
  select {
    pointer-events: none;

    width: 100%;
    padding: 6px 9px;

    border: 1px solid rgba(96, 125, 159, 0.25);
    border-radius: 3px;
  }
`;
