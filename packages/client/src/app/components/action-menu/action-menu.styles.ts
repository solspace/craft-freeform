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

  border: var(--button-border, none);
  :root:not([data-dark-mode="dark"]) & {
    border: 1px solid ${colors.gray250};
  };
  border-radius: ${borderRadius.md};
  background: light-dark(${colors.white}, var(--button-bg, ${colors.overlay}));
  color: light-dark(${colors.gray700}, var(--button-text-color, ${colors.gray700}));

  svg {
    width: 18px;
    height: 18px;
    stroke: ${colors.gray500};
  }

  &:hover,
  &.open {
    background: light-dark(rgba(96, 125, 159, 0.3), var(--button-bg--hover, ${colors.gray100}));
  }
`;

export const ActionMenuDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 100;

  min-width: 120px;

  background: light-dark(${colors.white}, ${colors.overlay});
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
  border-top: 0;
  :root:not([data-dark-mode="dark"]) & {
    border-top: 1px solid ${colors.gray200};
  };

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
