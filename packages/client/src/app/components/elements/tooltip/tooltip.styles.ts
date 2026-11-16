import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled, { css } from "styled-components";

type SurfaceProps = {
  $theme: TooltipTheme;
};

export type TooltipTheme = "dark" | "light";

const themeStyles = {
  dark: css`
    --freeform-tooltip-bg: #33404d;
    --freeform-tooltip-border: #33404d;
    box-shadow: 0 10px 24px rgb(8 15 24 / 18%);
    color: ${colors.white};
  `,
  light: css`
    --freeform-tooltip-bg: ${colors.overlay};
    --freeform-tooltip-border: ${colors.gray100};
    box-shadow: 0 10px 24px rgb(32 51 72 / 14%);
    color: ${colors.gray800};
  `,
};

export const ReferenceWrapper = styled.span`
  min-width: 0;
  max-width: 100%;
  display: inline-flex;
`;

export const Surface = styled.div<SurfaceProps>`
  max-width: min(320px, calc(100vw - ${spacings.xl}));
  padding: ${spacings.xs} ${spacings.sm};

  border-radius: ${borderRadius.sm};

  font-size: 12px;
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;

  ${({ $theme }) => themeStyles[$theme]}
  background: var(--freeform-tooltip-bg);
  border: 1px solid var(--freeform-tooltip-border);
  :root[data-dark-mode="dark"] & {
    --freeform-tooltip-bg: var(--gray-050);
    --freeform-tooltip-border: var(--medium-hairline-color);
    color: var(--gray-800);
    box-shadow: var(--menu-shadow);
  }

`;
