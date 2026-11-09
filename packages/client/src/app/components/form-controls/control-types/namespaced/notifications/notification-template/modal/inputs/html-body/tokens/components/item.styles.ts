import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const ItemWrapper = styled.a`
  cursor: pointer;

  display: block;

  padding: 0 ${spacings.xl} 3px;
  font-size: 14px;

  text-decoration: none;
  color: ${colors.text};

  &:hover {
    cursor: pointer;
    background-color: light-dark(${colors.gray050}, var(--ui-control-hover-bg-color, ${colors.gray050}));
  }

  &.active {
    background-color: light-dark(${colors.gray100}, var(--bg-selection-light, ${colors.gray100}));

    &:hover {
      background-color: light-dark(${colors.gray200}, var(--ui-control-active-bg-color, ${colors.gray200}));
    }
  }
`;
