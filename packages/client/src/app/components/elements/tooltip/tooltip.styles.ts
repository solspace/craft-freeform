import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled, { css } from "styled-components";

type SurfaceProps = {
  $theme: TooltipTheme;
};

export type TooltipTheme = "dark" | "light";

const themeStyles = {
  dark: css`
    background: ${colors.gray800};
    border: 1px solid ${colors.gray800};
    box-shadow: 0 10px 24px rgb(8 15 24 / 18%);
    color: ${colors.white};
  `,
  light: css`
    background: ${colors.white};
    border: 1px solid ${colors.gray100};
    box-shadow: 0 10px 24px rgb(32 51 72 / 14%);
    color: ${colors.gray800};
  `,
};

export const ReferenceWrapper = styled.span`
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
`;
