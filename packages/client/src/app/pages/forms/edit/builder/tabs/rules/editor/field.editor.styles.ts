import { scrollBar } from "@ff-client/styles/mixins";
import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const RulesEditorWrapper = styled.div`
  position: relative;

  flex: 1;
  min-width: 0;

  background: var(--freeform-builder-canvas, var(--c-surface-default));
  padding: ${spacings.xl};
  padding-block-start: var(--freeform-builder-padding-block, calc(var(--c-spacing-lg) + var(--c-spacing-md)));

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};

`;
