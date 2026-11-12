import styled, { css } from "styled-components";

export const sidebarItem = css`
  box-sizing: border-box;
  min-height: var(--c-size-control-md);
  padding: var(--c-spacing-sm) var(--c-spacing-md);
  gap: var(--c-spacing-md);
  font-size: var(--c-text-base);
  line-height: var(--c-leading-normal);
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

export const sidebarPadding = css`
  padding-block: var(--freeform-builder-padding-block, calc(var(--c-spacing-lg) + var(--c-spacing-md)));
  padding-inline: var(--freeform-sidebar-padding-inline, calc(var(--c-spacing-md) + var(--c-spacing-sm)));
`;

export const Sidebar = styled.div<WrapperProps>`
  position: relative;

  flex-basis: var(--freeform-sidebar-width, 300px);
  flex-shrink: 0;
  width: var(--freeform-sidebar-width, 300px);
  padding: 0;
  ${({ $noPadding }) => !$noPadding && sidebarPadding};
  box-sizing: border-box;

  min-height: 0;
  border-inline-end: 1px solid var(--c-color-neutral-border-quiet);
  background: var(--background-color);

  overflow-y: auto;

  --background-color: var(--c-surface-default);
  --margins: -18px;
`;
