import { builderSettingsDropdowns } from "@ff-client/styles/builder-settings";
import { sectionHeading } from "@ff-client/styles/craft6";
import { scrollBar } from "@ff-client/styles/mixins";
import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const FormSettingsContainer = styled.div`
  ${builderSettingsDropdowns};
  flex: 1;

  background: var(--freeform-builder-canvas, var(--c-surface-default));
  padding: ${spacings.xl};
  padding-block-start: var(--freeform-builder-padding-block, calc(var(--c-spacing-lg) + var(--c-spacing-md)));
  overflow-y: auto;
  min-width: 0;

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

export const SectionHeader = styled.h2`
  ${sectionHeading}
  display: flex;

  width: 100%;
  padding: 0 0 var(--c-spacing-lg);
  margin: 0;
`;

export const SectionContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  gap: calc(var(--c-spacing-lg) + var(--c-spacing-md));

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
