import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const CheckboxElement = styled.input`
  position: relative;
  appearance: none;
  display: inline-grid;
  place-content: center;
  flex: 0 0 16px;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  margin: 0;
  padding: 0;
  background: light-dark(#fbfcfe, ${colors.inputBackground});
  border: 1px solid light-dark(#b9c6d7, ${colors.inputBorder});
  border-radius: 3px;
  color: light-dark(currentColor, ${colors.text});
  vertical-align: middle;

  &:focus { outline: none; }
  &:focus-visible { box-shadow: var(--focus-ring); }
  &:hover:not(:disabled) { cursor: pointer; border-color: ${colors.muted}; }
  &:disabled { opacity: .5; cursor: not-allowed; }

  &::before {
    content: '';
    display: block;
    box-sizing: border-box;
    width: 5px;
    height: 9px;
    margin-top: -2px;
    border: solid currentColor;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) scale(0);
  }
  &:checked {
    background: var(--ui-control-selected-bg, var(--gray-500));
    border-color: var(--ui-control-selected-border, var(--gray-500));
    color: var(--ui-control-selected-color, #fff);
    &::before { transform: rotate(45deg) scale(1); }
  }
  &:indeterminate {
    background: var(--ui-control-selected-bg, var(--gray-500));
    border-color: var(--ui-control-selected-border, var(--gray-500));
    color: var(--ui-control-selected-color, #fff);
    &::before { width: 8px; height: 2px; border: 0; margin: 0; background: currentColor; transform: none; }
  }
`;
