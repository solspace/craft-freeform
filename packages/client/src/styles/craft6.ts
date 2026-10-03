import { css } from "styled-components";

// Match Craft's select/combobox chrome on the React dropdown controls too.
export const dropdownControl = css`
  box-sizing: border-box;
  min-height: var(--c-size-control-md);
  border: var(--c-input-border-width) var(--c-input-border-style)
    var(--c-input-border-color);
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
  padding-block: var(--c-input-spacing-block);
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

export const sectionHeading = css`
  color: var(--c-text-default);
  font-size: var(--c-text-lg);
  font-weight: 700;
  line-height: var(--c-leading-normal);
`;
