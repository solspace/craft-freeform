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

  color: light-dark(${colors.gray550}, var(--gray-800));
  font-weight: ${({ $regular }) => ($regular ? "normal" : "bold")} !important;
`;

export const LabelText = styled.span``;

export const RequiredStar = styled.span`
  &:after {
    content: 'asterisk';

    color: light-dark(${colors.red500}, ${colors.error});
    font-family: Craft;
    font-size: 10px;
  }
`;

const iconSize = 18;
export const TranslateIconWrapper = styled.span`
  fill: ${colors.gray500};

  &.active {
    cursor: pointer;
    fill: ${colors.blue500};
  }

  svg {
    width: ${iconSize}px;
    height: ${iconSize}px;
  }
`;
