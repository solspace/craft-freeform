import { css } from "styled-components";

// Match Craft's select/combobox chrome on the React dropdown controls too.
export const dropdownControl = css`
  box-sizing: border-box;
  min-height: var(--c-size-control-md);
  border: var(--c-input-border-width, var(--c-form-control-border-width))
    var(--c-input-border-style, var(--c-form-control-border-style))
    var(--c-input-border-color, var(--c-form-control-border-color));
  border-radius: var(--c-input-radius);
  background-color: var(--c-input-fill);
  color: var(--c-input-text);
  box-shadow: var(--c-input-shadow);
  font: inherit;

  &:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
    box-shadow: none;
  }
`;

// React-managed inputs use the same tokens as Craft's native form controls.
export const textControl = css`
  ${dropdownControl}
  padding-block: var(--c-input-spacing-block, 5px);
  padding-inline: var(--c-input-spacing-inline);

  &.fullwidth {
    width: 100%;
  }

  &.code {
    font-family: var(--c-font-mono);
  }

  &::placeholder {
    color: var(--c-text-quiet);
    font-style: normal;
  }

  &:disabled,
  &[readonly] {
    color: var(--c-text-quiet);
  }
`;

// Chrome for Freeform-owned buttons; never restyle Craft's global .btn class.
export const editorButton = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--c-spacing-sm);
  box-sizing: border-box;
  min-height: var(--c-size-control-md);
  padding: 0 var(--c-form-control-spacing-inline);
  border: 1px solid var(--c-color-neutral-border-quiet);
  border-radius: var(--c-form-control-radius);
  background: var(--c-color-neutral-fill-quiet);
  color: var(--c-text-default);
  font: inherit;
  line-height: var(--c-leading-normal);
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--c-color-neutral-fill-normal);
  }

  &:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
  }

  &:disabled { opacity: .5; cursor: default; }
  > svg { flex: none; width: 16px; height: 16px; }
`;

export const sectionHeading = css`
  color: var(--c-text-default);
  font-size: var(--c-text-lg);
  font-weight: 700;
  line-height: var(--c-leading-normal);
`;
