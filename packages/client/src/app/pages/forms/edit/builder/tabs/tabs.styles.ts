import { errorAlert } from "@ff-client/styles/mixins";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const TabWrapper = styled.nav`
  position: relative;

  display: grid;
  grid-template-columns: 300px max-content 1fr max-content;
  align-items: center;

  height: 50px;
  flex: 0 0 50px;

  box-sizing: border-box;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    inset-inline: var(--c-spacing-md, 8px);
    inset-block-end: 0;
    height: 1px;
    background: var(--c-color-neutral-border-quiet);
    pointer-events: none;
  }
`;

export const Heading = styled.h1`
  position: relative;
  min-width: 0;
  margin: 0;
  padding-inline-end: var(--c-spacing-xl, 24px);
`;

export const FormName = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: ${colors.gray700};
`;

export const TabsWrapper = styled.div`
  display: flex;
  align-self: flex-end;

  background-color: ${colors.gray050};
  border-radius: ${borderRadius.lg} ${borderRadius.lg} 0 0;
  box-shadow:
    inset 0 -1px 0 0 rgba(154, 165, 177, 0.25),
    0 0 0 1px rgba(154, 165, 177, 0.25);

  a {
    display: flex;
    align-items: center;

    height: 49px;
    padding: 0 ${spacings.xl};

    white-space: nowrap;

    color: var(--light-text-color);
    border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;

    &:hover {
      text-decoration: none;
      background-color: rgba(154, 165, 177, 0.15);

      &:not(.active) {
        &:not(:first-child) {
          border-top-left-radius: 0;
        }

        &:not(:last-child) {
          border-top-right-radius: 0;
        }
      }
    }

    &.active {
      background: ${colors.white};
      color: ${colors.gray700};
      box-shadow:
        inset 0 2px 0 ${colors.gray500},
        0 0 0 1px rgba(51, 64, 77, 0.1),
        0 2px 12px rgba(205, 216, 228, 0.5) !important;
    }

    &.errors {
      position: relative;
      color: ${colors.error};

      ${errorAlert};
    }

    > span[data-icon] {
      position: relative;
      left: 5px;
    }
  }
`;

export const BuilderTabsWrapper = styled(TabsWrapper)`
  align-self: center;
  gap: var(--c-tabs-tab-gap, var(--c-spacing-md));
  background: transparent;
  border-radius: 0;
  box-shadow: none;

  && a {
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
      background: var(--c-color-neutral-fill-normal);
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

export const SaveButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-self: end;
  gap: var(--c-spacing-md, 8px);
`;

export const SaveButton = styled.button`
  && {
    box-sizing: border-box;
    height: var(--c-size-control-md, 34px);
    min-height: var(--c-size-control-md, 34px);
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
  gap: var(--c-spacing-1px, 1px);
`;

export const HistoryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: var(--c-size-control-md, 34px);
  height: var(--c-size-control-md, 34px);
  flex: 0 0 var(--c-size-control-md, 34px);
  padding: 0;
  border: 1px solid var(--c-color-neutral-border-loud);
  border-radius: 0;
  background: transparent;
  color: var(--c-color-neutral-on-quiet);
  cursor: pointer;

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
`;

export const BetaLabel = styled.span`
  color: ${colors.gray700};
  font-size: 9px;
  margin-left: ${spacings.xs};
  font-weight: bold;
  transform: translateY(-4px);
  display: inline-block;
  line-height: 1;
`;
