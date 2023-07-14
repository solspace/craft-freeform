import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const CellFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};

  height: 100%;
  padding: ${spacings.sm} ${spacings.lg};
  margin: 0;

  &.errors {
    color: ${colors.error};

    input,
    textarea,
    select {
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

export const Label = styled.label`
  display: block;
  color: ${colors.gray550};
  font-weight: bold;
`;

export const Instructions = styled.div`
  color: ${colors.gray300};
  font-style: italic;
`;
