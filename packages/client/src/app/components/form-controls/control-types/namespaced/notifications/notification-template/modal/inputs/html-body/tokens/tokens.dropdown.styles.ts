import { labelText, scrollBar } from "@ff-client/styles/mixins";
import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const TokenDropdownWrapper = styled.div`
  position: absolute;
  z-index: var(--c-layer-popover);
  left: 200px;
  top: 200px;

  display: flex;
  flex-direction: column;
  gap: 0;

  width: 300px;
  max-width: calc(100vw - 16px);
  max-height: 300px;
  overflow: hidden;

  background-color: var(--c-surface-overlay);
  color: var(--c-text-default);

  border: 1px solid var(--c-color-neutral-border-normal);
  border-radius: var(--c-radius-md);
  box-shadow: var(--c-shadow-lg);
`;

export const Title = styled.h3`
  background: var(--c-surface-overlay);
  border-bottom: 1px solid var(--c-color-neutral-border-quiet);

  padding: 8px 8px;
  margin: 0;

  ${labelText};
  color: var(--c-text-default);
  font-size: 11px;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};

  padding: ${spacings.xs} 0;

  overflow-y: auto;
  ${scrollBar};
`;
