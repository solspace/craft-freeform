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
