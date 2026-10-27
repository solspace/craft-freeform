import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from "@ff-client/styles/variables";
import styled from "styled-components";

export const ButtonGroupWrapper = styled.div<{
  $compact?: boolean;
  $small?: boolean;
}>`
  display: inline-flex;
  flex-direction: row;
  justify-content: start;
  align-items: stretch;

  width: fit-content;
  max-width: 100%;
  padding-top: ${spacings.sm};

  ${({ $compact }) =>
    $compact &&
    `
    > button { padding-inline: 8px; white-space: nowrap; }
  `}
  ${({ $small }) =>
    $small &&
    `
    > button { min-width: 0; padding-inline: 4px; font-size: 12px; white-space: nowrap; }
    > button > span { display: inline-block; transform: scaleX(0.88); }
  `}
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 auto;
  min-width: 28px;

  padding: ${spacings.xs} ${spacings.md};

  background-color: ${colors.gray100};
  box-shadow: ${shadows.right};
  box-sizing: border-box;

  > span { flex: 0 0 auto; }

  &.active {
    color: ${colors.white};
    background-color: ${colors.gray500};
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
