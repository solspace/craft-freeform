import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

type LabelProps = {
  $regular?: boolean;
};

export const Label = styled.label<LabelProps>`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 6px;

  color: var(--c-text-default);
  font-weight: ${({ $regular }) => ($regular ? "normal" : "bold")} !important;
`;

export const LabelText = styled.span``;

export const RequiredStar = styled.span`
  &:after {
    content: '*';

    color: light-dark(${colors.red500}, ${colors.error});
    font-family: inherit;
    font-size: inherit;
  }
`;

const iconSize = 18;
export const TranslateIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  flex: none;
  color: var(--c-text-quiet);
  fill: currentColor;

  &.active {
    cursor: pointer;
    color: var(--c-color-accent-on-quiet);
  }

  svg {
    width: ${iconSize}px;
    height: ${iconSize}px;
  }
`;
