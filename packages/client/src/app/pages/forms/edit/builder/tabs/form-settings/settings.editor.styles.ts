import { scrollBar } from '@ff-client/styles/mixins';
import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FormSettingsContainer = styled.div`
  flex: 1;

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

export const SectionHeader = styled.h1`
  display: flex;

  width: 100%;
  padding: 0 0 ${spacings.md};
  margin: 0;
`;

export const SectionContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  gap: ${spacings.md};

  width: 100%;

  &:empty {
    height: 50px;

    &:before {
      content: 'No settings available for this section.';
      font-style: italic;
      color: ${colors.gray200};
    }
  }
`;
