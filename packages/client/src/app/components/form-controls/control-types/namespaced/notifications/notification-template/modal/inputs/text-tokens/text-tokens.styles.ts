import styled from "styled-components";

export const TextTokenWrapper = styled.div`
  position: relative;
`;

export const TextTokenContainer = styled.div`
  span[data-freeform-token] {
    display: inline-block;

    background-color: light-dark(#e4edf6, var(--bg-selection-light));
    color: var(--text-color);
    border: 1px solid light-dark(#33404d1a, var(--hairline-color));
    border-radius: 3px;
    padding: 0.0625em 0.25em;

    &[data-selected] {
      outline: 3px solid light-dark(#0078d4, var(--blue-500, #0078d4)) !important;
    }
  }
`;

export const AddButton = styled.button`
  position: absolute;
  top: 0;
  inset-inline-end: 0;

  margin: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  padding: 0;

  height: 26px;
  min-height: 26px;

  &&.btn {
    color: var(--secondary-button-text-color, var(--text-color));
    background: var(--secondary-button-bg, var(--button-bg));
    border: 1px solid var(--input-border-color, var(--hairline-color));
  }

  &&.btn:hover {
    background: var(--secondary-button-bg--hover, var(--button-bg--hover));
    border-color: var(--light-text-color, var(--input-border-color));
  }

  &&.btn:focus-visible {
    box-shadow: var(--focus-ring-light, var(--focus-ring));
  }
`;
