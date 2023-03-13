import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FormSettingsWrapper = styled.div`
  display: flex;
  height: 100%;
  background: ${colors.white};
`;

export const FormSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};

  width: calc(100% - 300px);
  padding: ${spacings.lg};
`;

export const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
`;

export const SectionLink = styled.button`
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: ${spacings.sm};

  padding: ${spacings.sm} ${spacings.md};
  border-radius: ${borderRadius.lg};

  color: ${colors.gray700};
  font-size: 12px;
  line-height: 12px;

  transition: background-color 0.2s ease-out;
  text-decoration: none;

  &.active {
    background-color: ${colors.gray200};
  }

  &:hover:not(.active) {
    background-color: ${colors.gray100};
  }
`;

export const SectionHeader = styled.h2`
  padding: 0 0 ${spacings.lg};
  margin: 0;
`;

export const SectionIcon = styled.div`
  width: 13px;
  height: 13px;
`;
