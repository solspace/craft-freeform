import { builderSettingsDropdowns } from "@ff-client/styles/builder-settings";
import { sectionHeading } from "@ff-client/styles/craft6";
import { scrollBar } from "@ff-client/styles/mixins";
import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const PropertyEditorWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};

  background: var(--freeform-builder-canvas, var(--c-surface-default));
  padding: ${spacings.xl};
  padding-block-start: var(--freeform-builder-padding-block, calc(var(--c-spacing-lg) + var(--c-spacing-md)));

  overflow-y: auto;

  ${scrollBar};

  h2 {
    ${sectionHeading}
  }
`;

export const SettingsWrapper = styled.div`
  ${builderSettingsDropdowns};
  display: flex;
  flex-direction: column;
  gap: calc(var(--c-spacing-lg) + var(--c-spacing-md));
`;
