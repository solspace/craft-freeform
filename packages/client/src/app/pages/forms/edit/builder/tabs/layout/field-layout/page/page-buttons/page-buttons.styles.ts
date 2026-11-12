import { editorButton } from "@ff-client/styles/craft6";
import { borderRadius, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const ButtonGroupWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  padding: ${spacings.sm} ${spacings.md};

  border: 1px solid transparent;
  border-radius: ${borderRadius.md};

  cursor: pointer;

  transition:
    border-color 0.2s ease-out,
    background-color 0.2s ease-out;

  &.active {
    border: 1px dashed var(--c-color-accent-border-normal);
  }

  &:hover {
    background: var(--c-color-neutral-fill-quiet);

    &:not(.active) {
      border: 1px solid var(--c-color-neutral-border-quiet);
    }
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacings.md};
`;

export const Button = styled.button.attrs({ type: "button" })`
  ${editorButton}
  background: transparent;
  border-style: dashed;
  color: var(--c-text-quiet);

  &:hover {
    color: var(--c-text-default);
    background: var(--c-color-neutral-fill-quiet);
  }

  img, svg { width: 16px; height: 16px; }
  .button-edit-cue { width: 12px; height: 12px; opacity: .7; margin-inline-start: var(--c-spacing-sm); }
`;
