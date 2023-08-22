import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Label = styled.label`
  display: flex;
  font-weight: bold;
  position: relative;
  flex-direction: row;
  align-items: flex-start;
  color: ${colors.gray550};
  justify-content: flex-start;

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

export const Instructions = styled.div`
  padding-bottom: 3px;

  color: ${colors.gray300};
  font-style: italic;
  font-size: 12px;
`;

export const FieldCellWrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: ${spacings.sm} ${spacings.md};
  margin: 0;

  border: 1px solid transparent;
  border-radius: ${borderRadius.md};

  transition: border-color 0.2s ease-out, background-color 0.2s ease-out;

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
