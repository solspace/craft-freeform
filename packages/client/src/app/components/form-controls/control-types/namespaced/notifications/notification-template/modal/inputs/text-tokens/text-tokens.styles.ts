import { textControl } from "@ff-client/styles/craft6";
import styled from "styled-components";

export const TextTokenWrapper = styled.div`
  position: relative;
  min-width: 0;
`;

export const TextTokenContainer = styled.div`
  ${textControl}
  width: 100%;
  padding-inline-end: 36px;
  overflow-wrap: anywhere;
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
  top: 50%;
  inset-inline-end: 4px;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 24px;
  height: 24px;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--c-radius-sm);
  background: transparent;
  color: var(--c-text-quiet);
  cursor: pointer;
  craft-icon { width: 14px; height: 14px; }
  &:hover { background: var(--c-color-neutral-fill-quiet); color: var(--c-text-default); }
  &:focus-visible { outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline); outline-offset: 0; }
`;
