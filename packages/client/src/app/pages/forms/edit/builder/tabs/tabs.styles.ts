import { errorAlert } from "@ff-client/styles/mixins";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
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
  color: ${colors.gray700};
`;

export const TabsRegion = styled.div`
  grid-area: tabs;
  position: relative;
  min-width: 0;
  align-self: end;
`;

const tabDimensions = css`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 49px;
  padding: 0 ${spacings.xl};
  box-sizing: border-box;
  white-space: nowrap;
  font: inherit;
`;

export const TabsWrapper = styled.div.attrs({ className: "freeform-tabs" })`
  display: flex;
  width: max-content;
  max-width: 100%;
  background-color: light-dark(${colors.gray050}, ${colors.mutedSurface});
  border-radius: ${borderRadius.lg} ${borderRadius.lg} 0 0;
  box-shadow:
    inset 0 -1px 0 0 rgba(154, 165, 177, 0.25),
    0 0 0 1px rgba(154, 165, 177, 0.25);

  > a, > button {
    ${tabDimensions};
    min-width: 0;

    color: var(--light-text-color);
    border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;

    > span:first-child { overflow: hidden; text-overflow: ellipsis; }

    &:focus-visible { outline: 2px solid var(--link-color); outline-offset: -3px; }

    &:hover {
      text-decoration: none;
      /* Keep the strip's bottom hairline visible beneath the hover fill. */
      background: linear-gradient(
        var(--ui-control-bg-color, ${colors.gray050}),
        var(--ui-control-bg-color, ${colors.gray050})
      ) top / 100% calc(100% - 1px) no-repeat;
      :root:not([data-dark-mode="dark"]) &:not(.active) { background: rgba(154, 165, 177, 0.15); }

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
      background: light-dark(${colors.white}, ${colors.surface});
      color: ${colors.gray700};
      box-shadow:
        inset 0 2px 0 var(--white),
        0 0 0 1px ${colors.border} !important;
  :root:not([data-dark-mode="dark"]) & {
    box-shadow: inset 0 2px 0 ${colors.gray500},
        0 0 0 1px rgba(51, 64, 77, 0.1),
        0 2px 12px rgba(205, 216, 228, 0.5) !important;
  };
    }

    &.errors {
      position: relative;
      &, &.active, &:hover, &:focus-visible { color: ${colors.error}; }
      > span { color: inherit; }

      ${errorAlert};
    }

    > span[data-icon] {
      position: relative;
      left: 5px;
    }
  }
`;

export const MoreButton = styled.button`
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  cursor: pointer;
  svg { flex-shrink: 0; }
`;

export const TabMeasurements = styled.div`
  display: flex;
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
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.md};
  background: light-dark(${colors.white}, ${colors.surface});
  box-shadow: 0 4px 16px rgb(51 64 77 / 18%);

  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border-radius: ${borderRadius.sm};
    color: ${colors.gray700};
    overflow-wrap: anywhere;
    text-decoration: none;
    &.errors { color: ${colors.error}; }
    &:hover, &:focus-visible { background: ${colors.gray050}; outline: 2px solid var(--link-color); outline-offset: -2px; }
  }
`;

export const SaveButtonWrapper = styled.div`
  grid-area: actions;
  display: flex;
  align-items: center;
  justify-self: end;
  gap: ${spacings.md};
  margin-inline-start: 12px;
`;

export const SaveButton = styled.button``;

export const HistoryControls = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: ${borderRadius.md};
  background: light-dark(#c4cfe1, var(--ui-control-bg-color));
`;

export const HistoryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 39px;
  height: 34px;
  padding: 0;
  border: 0;
  background: light-dark(#c4cfe1, var(--ui-control-bg-color));
  color: light-dark(#5a6875, var(--text-color));
  cursor: pointer;

  & + & {
    border-left: 1px solid light-dark(#e3ecfb, var(--hairline-color));
  }

  &:hover:not(:disabled) {
    background: light-dark(#b5c4d8, var(--ui-control-hover-bg-color));
  }

  &:active:not(:disabled) {
    background: light-dark(#a6b4c9, var(--ui-control-active-bg-color));
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }

  &:disabled {
    background: light-dark(#d5dfeb, var(--ui-control-bg-color));
    color: light-dark(#a0aab4, var(--light-text-color));
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
  color: ${colors.gray700};
  font-size: 9px;
  margin-left: ${spacings.xs};
  font-weight: bold;
  transform: translateY(-4px);
  display: inline-block;
  line-height: 1;
`;
