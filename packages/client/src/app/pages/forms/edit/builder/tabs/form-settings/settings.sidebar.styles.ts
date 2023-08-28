import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
`;

export const SectionLink = styled.button`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${spacings.sm};

  padding: ${spacings.sm} ${spacings.md};
  border-radius: ${borderRadius.lg};

  color: ${colors.gray700};
  fill: currentColor;

  transition: background-color 0.2s ease-out;
  text-decoration: none;

  &.active {
    color: ${colors.white};
    background-color: ${colors.gray500};
  }

  &.errors {
    color: ${colors.error};
  }

  &.active.errors {
    color: ${colors.white};
    background-color: ${colors.error};
  }

  &:hover:not(.active) {
    background-color: ${colors.gray100};
  }
`;

export const SectionIcon = styled.div`
  width: 18px;
  height: 18px;
`;
