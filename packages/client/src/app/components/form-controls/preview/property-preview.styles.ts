import { scrollBar } from "@ff-client/styles/mixins";
import styled from "styled-components";

export const PreviewSurface = styled.div`
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--c-color-neutral-border-normal);
  border-radius: var(--c-form-control-radius);
  background: var(--c-surface-default);
  cursor: pointer;
  transition: border-color 0.15s ease-out;

  &:hover { border-color: var(--c-color-neutral-border-loud); }
  &:focus-visible {
    outline: 2px solid var(--c-color-focus-outline);
    outline-offset: 2px;
  }

  input, select, textarea, a { pointer-events: none; }
`;

export const PreviewContent = styled.div`
  min-height: 48px;
  max-height: 180px;
  min-width: 0;
  overflow: auto;
  overflow-wrap: anywhere;
  ${scrollBar};
`;

export const PreviewEmpty = styled.div`
  display: flex;
  align-items: center;
  min-height: 48px;
  color: var(--c-text-light);
  font-size: 12px;
  font-weight: normal;
  font-style: italic;
  line-height: 1.5;
`;

export const PreviewCue = styled.div`
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--c-color-neutral-border-quiet);
  color: var(--c-color-accent-on-quiet);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
`;
