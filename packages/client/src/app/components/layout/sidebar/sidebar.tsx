import { borderRadius, spacings } from "@ff-client/styles/variables";
import styled, { css } from "styled-components";

export const sidebarItem = css`
  box-sizing: border-box;
  border: 1px solid transparent;
  background: transparent;
  color: var(--c-text-default);
  fill: currentColor;
  text-decoration: none;
  transition: color 0.15s ease-out, border-color 0.15s ease-out,
    background-color 0.15s ease-out;

  &.active {
    background: var(--c-color-accent-fill-quiet);
    color: var(--c-color-accent-on-quiet);
    border-color: var(--c-color-accent-border-normal);
  }

  &:hover {
    text-decoration: none;
  }

  &:hover:not(.active) {
    background: color-mix(in srgb, currentColor, transparent 95%);
  }

  &:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
  }

  &.errors {
    color: var(--c-color-danger-on-normal);
  }

  &.active.errors {
    border-color: var(--c-color-danger-border-loud);
  }
`;

type WrapperProps = {
  $lean?: boolean;
  $noPadding?: boolean;
};

export const Sidebar = styled.div<WrapperProps>`
  position: relative;

  flex-basis: 300px;
  flex-shrink: 0;
  width: 300px;
  padding: ${({ $lean, $noPadding }): string =>
    $lean ? spacings.sm : $noPadding ? "0" : spacings.lg};
  box-sizing: border-box;

  border-bottom-left-radius: ${borderRadius.lg};
  box-shadow: inset -1px 0 0 0 rgb(154 165 177 / 25%);
  background: var(--background-color);

  overflow-y: auto;

  --background-color: color-mix(in srgb, var(--c-surface-default, #fff) 98%, var(--c-text-default, #2b3549));
  --margins: -18px;
`;
