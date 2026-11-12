import { textControl } from "@ff-client/styles/craft6";
import styled from "styled-components";

export const BuilderWrapper = styled.div`
  --freeform-builder-padding-block: calc(var(--c-spacing-lg) + var(--c-spacing-md));
  --freeform-sidebar-width: calc(300px + var(--cp-container-padding));
  --freeform-sidebar-padding-inline: calc(var(--c-spacing-md) + var(--c-spacing-sm));
  --freeform-builder-canvas: color-mix(in srgb, var(--c-surface-default) 65%, var(--c-surface-sunken));
  position: relative;

  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  min-height: 0;

:where(input.text:not([slot='input']), textarea.text:not([slot='input'])) {
    ${textControl}
  }
`;

export const BuilderContent = styled.div`
  flex: 1;
  min-height: 0;
  margin-inline: calc(-1 * var(--cp-container-padding));
  background: var(--freeform-builder-canvas);
  overflow: hidden;
`;
