import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from "@ff-client/styles/variables";
import styled from "styled-components";

export const ActionMenuWrapper = styled.div`
  position: relative;
`;

export const ActionMenuButton = styled.button`
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  width: var(--ui-control-height);
  height: var(--ui-control-height);
  padding: 0;

  border: 1px solid ${colors.gray250};
  border-radius: ${borderRadius.md};
  background: ${colors.white};
  color: ${colors.gray700};

  svg {
    width: 18px;
    height: 18px;
    stroke: ${colors.gray500};
  }

  &:hover,
  &.open {
    background: rgba(96, 125, 159, 0.3);
  }
`;

export const ActionMenuDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 100;

  min-width: 120px;

  background: ${colors.white};
  box-shadow: ${shadows.boxSubtle};

  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.md};
`;

export const ActionMenuItem = styled.button<{ $destructive?: boolean }>`
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: ${spacings.sm};

  width: 100%;
  padding: ${spacings.sm} ${spacings.md};

  background: transparent;
  color: ${({ $destructive }) =>
    $destructive ? colors.red600 : colors.gray700};

  border: 0;
  border-top: 1px solid ${colors.gray200};

  font-size: 12px;
  text-align: left;

  &:first-child {
    border-top: 0;
  }

  &:hover {
    background: ${colors.gray050};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;
