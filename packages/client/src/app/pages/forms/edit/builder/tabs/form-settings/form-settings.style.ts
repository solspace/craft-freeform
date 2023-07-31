import { scrollBar } from '@ff-client/styles/mixins';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FormSettingsWrapper = styled.div`
  display: flex;
  height: 100%;
  background: ${colors.white};
`;

export const FormSettingsContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;

  background: ${colors.white};
  padding: ${spacings.xl};
  overflow-y: auto;
  width: calc(100% - 300px);

  ${scrollBar};

  div[class^='ControlWrapper-'] {
    div[class^='CheckboxWrapper-'] {
      align-items: start;

      div[class^='CheckboxItem-'] {
        padding-top: 4px;
      }
    }
  }
`;

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

  transition: background-color 0.2s ease-out;
  text-decoration: none;

  &.active {
    color: ${colors.white};
    background-color: ${colors.gray500};
  }

  &.errors {
    color: ${colors.error};
    fill: ${colors.error};
  }

  &:hover:not(.active) {
    background-color: ${colors.gray100};
  }
`;

export const SectionHeader = styled.h1`
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: -11px;
  margin-bottom: 14px;
`;

export const SectionIcon = styled.div`
  width: 18px;
  height: 18px;
`;
