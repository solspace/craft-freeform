import { errorAlert } from "@ff-client/styles/mixins";
import { borderRadius, spacings } from "@ff-client/styles/variables";
import styled, { css } from "styled-components";

export const TabWrapper = styled.nav`
  position: relative;
  container: builder-header / inline-size;
  flex: 0 0 auto;
  min-width: 0;
  overflow: hidden;
`;

export const HeaderRow = styled.div`
  display: grid;
  grid-template: "heading tabs actions" 50px / 300px minmax(0, 1fr) max-content;
  align-items: center;
  box-sizing: border-box;

  @container builder-header (max-width: 760px) {
    grid-template: "heading actions" 50px "tabs tabs" 49px / minmax(0, 1fr) max-content;
  }
`;

export const Heading = styled.h1`
  grid-area: heading;
  position: relative;
  margin: 0;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const FormName = styled.span`
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--c-text-default);
`;

export const TabsRegion = styled.div`
  grid-area: tabs;
  position: relative;
  min-width: 0;
  align-self: stretch;
  display: flex;
  align-items: center;
`;

const tabDimensions = css`
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--c-size-control-md, 34px);
  padding-inline: calc(var(--c-tab-spacing-inline, 1em) - 1px);
  border: 1px solid transparent;
  font-size: var(--c-tabs-font-size, var(--c-text-base));
  box-sizing: border-box;
  white-space: nowrap;
  font-family: inherit;
`;

export const TabsWrapper = styled.div`
  display: flex;
  width: max-content;
  max-width: 100%;
  align-self: center;
  gap: var(--c-tabs-tab-gap, var(--c-spacing-md));
  background: transparent;
  border-radius: 0;
  box-shadow: none;

  && > a, && > button {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
    white-space: nowrap;
    position: relative;
    box-sizing: border-box;
    height: var(--c-size-control-md, 34px);
    padding-inline: calc(var(--c-tab-spacing-inline, 1em) - 1px);
    border: 1px solid transparent;
    border-radius: var(--c-form-control-radius);
    background: transparent;
    color: var(--c-text-default);
    font-size: var(--c-tabs-font-size, var(--c-text-base));
    text-decoration: none;
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }

    &::after {
      content: none;
    }

    &:hover,
    &:hover:not(.active):not(:first-child),
    &:hover:not(.active):not(:last-child) {
      background: var(--c-color-neutral-fill-quiet);
      border-radius: var(--c-form-control-radius);
      color: var(--c-text-default);
    }

    &:focus-visible {
      outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
      outline-offset: var(--c-focus-outline-offset);
    }

    &.active {
      background: var(--c-color-accent-fill-quiet);
      border-color: var(--c-color-accent-border-normal);
      color: var(--c-color-accent-on-quiet);
      font-weight: 700;
      box-shadow: none !important;
    }

    &.errors {
      color: var(--c-color-danger-on-normal);
    }

    &.active.errors {
      background: var(--c-color-danger-fill-quiet);
      border-color: var(--c-color-danger-border-normal);
      color: var(--c-color-danger-on-quiet);
    }
  }
`;

export const BuilderTabLabel = styled.span`
  display: grid;

  &::after {
    content: attr(data-label);
    grid-area: 1 / 1;
    visibility: hidden;
    font-weight: 700;
    user-select: none;
  }

  > span {
    grid-area: 1 / 1;
    text-align: center;
  }

  /* Reserve the bold label's width so changing tabs doesn't move its neighbors. */
  > span[aria-hidden] {
    visibility: hidden;
    font-weight: 700;
    user-select: none;
  }
`;

export const BuilderTabsWrapper = styled(TabsWrapper)``;

export const MoreButton = styled.button`
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: var(--c-text-default);
  cursor: pointer;
  svg { flex-shrink: 0; }
`;

export const TabMeasurements = styled.div`
  display: flex;
  gap: var(--c-tabs-tab-gap, var(--c-spacing-md));
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  top: 0;
  inset-inline-start: 0;
  visibility: hidden;
  pointer-events: none;
  > span { ${tabDimensions}; flex: 0 0 auto; }
  > .errors { ${errorAlert}; }
`;

export const OverflowMenu = styled.div`
  z-index: 1000;
  min-width: 180px;
  max-width: calc(100vw - 16px);
  max-height: min(70vh, 420px);
  overflow: auto;
  padding: 6px;
  border: 1px solid var(--c-color-neutral-border-normal);
  border-radius: ${borderRadius.md};
  background: var(--c-modal-fill);
  box-shadow: 0 4px 16px rgb(51 64 77 / 18%);

  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border-radius: ${borderRadius.sm};
    color: var(--c-text-default);
    overflow-wrap: anywhere;
    text-decoration: none;
    &.errors { color: var(--c-color-danger-on-normal); }
    &:hover, &:focus-visible { background: var(--c-color-neutral-fill-quiet); outline: 2px solid var(--link-color); outline-offset: -2px; }
  }
`;

export const SaveButtonWrapper = styled.div`
  --freeform-builder-action-height: 36px;
  grid-area: actions;
  margin-inline-start: 12px;
  display: flex;
  align-items: center;
  justify-self: end;
  gap: var(--c-spacing-md, 8px);
`;

export const SaveButton = styled.button`
  && {
    box-sizing: border-box;
    height: var(--freeform-builder-action-height, 36px);
    min-height: var(--freeform-builder-action-height, 36px);
    padding-block: 0;
    padding-inline: var(--c-form-control-spacing-inline, 8px);
    border-radius: var(--c-form-control-radius);
    font-size: var(--c-text-base);
    font-weight: 600;
    line-height: var(--c-leading-normal);
  }

  &:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
  }
`;

export const HistoryControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;

export const HistoryButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: calc(var(--freeform-builder-action-height, 36px) * 0.85);
  height: calc(var(--freeform-builder-action-height, 36px) * 0.85);
  flex: 0 0 calc(var(--freeform-builder-action-height, 36px) * 0.85);
  padding: 0;
  border: 1px solid var(--c-color-neutral-border-loud);
  border-radius: 0;
  background: transparent;
  color: var(--c-color-neutral-on-quiet);
  cursor: pointer;

  svg {
    width: calc(18px * 0.85);
    height: calc(16px * 0.85);
  }

  & + & {
    margin-inline-start: -1px;
  }

  &:first-child {
    border-start-start-radius: var(--c-form-control-radius);
    border-end-start-radius: var(--c-form-control-radius);
  }

  &:last-child {
    border-start-end-radius: var(--c-form-control-radius);
    border-end-end-radius: var(--c-form-control-radius);
  }

  &:hover:not(:disabled) {
    background: color-mix(
      in oklab,
      var(--c-color-neutral-fill-quiet),
      var(--c-color-mix-hover)
    );
  }

  &:active:not(:disabled) {
    background: color-mix(
      in oklab,
      var(--c-color-neutral-fill-quiet),
      var(--c-color-mix-active)
    );
  }

  &:focus-visible {
    z-index: 1;
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const SubmissionsShortcut = styled.a`
  display: inline-flex;
  align-items: center;
  justify-self: start;
  width: max-content;
  font-size: 13px;
  white-space: nowrap;
  gap: 4px;
  text-decoration: none;

  margin-block: 0;
  margin-inline: 2px;
  margin-left: ${spacings.sm};
  min-height: var(--input-height);
  padding-block: 4px;
  padding: 5px 10px;

  border: 1px solid rgba(154, 165, 177, 0.35);
  border-radius: var(--radius-md);
  background: rgba(154, 165, 177, 0.08);
  color: var(--link-color);

  &:hover {
    text-decoration: none;
    border-color: rgba(154, 165, 177, 0.6);
    background: rgba(154, 165, 177, 0.14);
  }

  @container builder-header (max-width: 1100px) {
    display: none;
  }
`;

export const BetaLabel = styled.span`
  color: var(--c-text-default);
  font-size: 9px;
  margin-left: ${spacings.xs};
  font-weight: bold;
  transform: translateY(-4px);
  display: inline-block;
  line-height: 1;
`;
