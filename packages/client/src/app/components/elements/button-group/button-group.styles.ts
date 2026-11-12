import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const ButtonGroupWrapper = styled.div.attrs({
  className: "freeform-button-group",
})<{
  $compact?: boolean;
  $small?: boolean;
  $stacked?: boolean;
  $flush?: boolean;
}>`
  display: inline-flex;
  flex-direction: row;
  justify-content: start;
  align-items: stretch;

  width: fit-content;
  max-width: 100%;
  padding-top: ${({ $flush }) => ($flush ? "0" : spacings.sm)};

  ${({ $compact }) =>
    $compact &&
    `
    > button { padding-inline: 8px; white-space: nowrap; }
  `}
  ${({ $small }) =>
    $small &&
    `
    > button { min-width: 0; padding-inline: 4px; font-size: 12px; white-space: nowrap; }

  `}

  ${({ $stacked }) =>
    $stacked &&
    `
    width: 100%;
    && > button {
      flex: 1 1 auto;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
      min-height: 68px;
      padding: 10px 8px;
      line-height: 18px;
    }
    && > button > span:not(.button-group-icon) { white-space: nowrap; }
    && > button > .button-group-icon {
      width: 22px;
      height: 22px;
      svg { width: 22px; height: 22px; }
    }
  `}
`;

export const Button = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 0 1 auto;
  min-width: 28px;
  min-height: var(--c-size-control-md);
  padding: var(--c-spacing-xs) var(--c-spacing-md);
  border: 1px solid var(--c-form-control-border-color);
  border-radius: 0;
  background: var(--c-surface-default);
  color: var(--c-text-quiet);
  box-shadow: none;
  box-sizing: border-box;
  font: inherit;
  cursor: pointer;
  transition: background-color 120ms ease-out, border-color 120ms ease-out, color 120ms ease-out;
  & + & { margin-inline-start: -1px; }
  &:first-child { border-start-start-radius: var(--c-radius-md); border-end-start-radius: var(--c-radius-md); }
  &:last-child { border-start-end-radius: var(--c-radius-md); border-end-end-radius: var(--c-radius-md); }

  > span { flex: 0 0 auto; }
  > .button-group-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    line-height: 1;
    svg { display: block; width: 14px; height: 14px; }
  }
  > span[data-label] {
    display: grid;
    &::after {
      content: attr(data-label);
      font-weight: 600;
      visibility: hidden;
      grid-area: 1 / 1;
      height: 0;
    }
  }

  &:hover:not(:disabled):not(.active) {
    background: color-mix(in srgb, var(--c-text-default) 4%, var(--c-surface-default));
    color: var(--c-text-default);
  }
  &:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: -2px;
    z-index: 2;
  }
  &.active {
    z-index: 1;
    color: var(--c-text-default);
    background: var(--c-color-accent-fill-quiet);
    border-color: var(--c-color-accent-border-normal);
    box-shadow: inset 0 0 0 1px var(--c-color-accent-border-normal);
    font-weight: 600;
    .button-group-icon { color: var(--c-color-accent-border-loud); }
  }
  &:disabled { opacity: .5; cursor: default; }
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;
