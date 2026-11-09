import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from "@ff-client/styles/variables";
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
    > button > span:not(.button-group-icon) { display: inline-block; transform: scaleX(0.88); }
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 0 1 auto;
  min-width: 28px;

  padding: ${spacings.xs} ${spacings.md};

  min-height: var(--ui-control-height, 34px);
  border: var(--button-border, none);
  background-color: light-dark(${colors.gray100}, var(--button-bg, ${colors.gray100}));
  box-shadow: none;
  :root:not([data-dark-mode="dark"]) & {
    box-shadow: ${shadows.right};
  };
  box-sizing: border-box;

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

  &:hover:not(:disabled):not(.active) {
    background-color: var(--button-bg--hover, ${colors.gray200});
  }

  &:focus-visible {
    outline: 0;
    box-shadow: var(--focus-ring);
    position: relative;
    z-index: 1;
  }

  &.active {
    color: ${colors.white};
    background-color: light-dark(${colors.gray500}, var(--bg-selection-dark, ${colors.gray500}));
  }

  &:first-child {
    border-top-left-radius: ${borderRadius.lg};
    border-bottom-left-radius: ${borderRadius.lg};
  }

  &:last-child {
    border-top-right-radius: ${borderRadius.lg};
    border-bottom-right-radius: ${borderRadius.lg};

    box-shadow: none;
  }
`;
