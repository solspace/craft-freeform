import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const SubmitFormWrapper = styled.div`
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: ${spacings.xs};

  padding: ${spacings.xs} ${spacings.sm};
  border: 1px solid #cdd8e4;
  background-color: ${colors.white};

  border-radius: ${borderRadius.md};

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: ${colors.teal550};
    background-color: ${colors.teal050};
  }

  &.active {
    background-color: ${colors.gray500};
    border-color: ${colors.gray700};

    color: white;
    fill: currentColor;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const Label = styled.label`
  cursor: pointer;

  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
