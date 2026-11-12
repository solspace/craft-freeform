import { builderSettingsDropdowns } from "@ff-client/styles/builder-settings";
import { sectionHeading } from "@ff-client/styles/craft6";
import { scrollBar } from "@ff-client/styles/mixins";
import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const PropertyEditorWrapper = styled.div`
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};

  padding: ${spacings.xl};
  padding-block-start: var(--freeform-builder-padding-block, calc(var(--c-spacing-lg) + var(--c-spacing-md)));

  background: var(--freeform-builder-canvas, var(--c-surface-default));
  overflow-y: auto;

  ${scrollBar};

  --background-color: ${colors.surface};
  --margins: -24px;

  h2 {
    ${sectionHeading}
    padding: 0;
    margin: 0;
  }
`;

export const SettingsWrapper = styled.div`
  ${builderSettingsDropdowns};
  display: flex;
  flex-direction: column;
  gap: calc(var(--c-spacing-lg) + var(--c-spacing-md));
`;
