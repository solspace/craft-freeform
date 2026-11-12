import { editorButton } from "@ff-client/styles/craft6";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const PopUpWrapper = styled(animated.div)`
  position: absolute;
  top: 24px;
  right: -16px;

  transform-origin: 90% -20%;
`;

export const IconBox = styled.div`
  position: absolute;
  top: -30px;
  right: 10px;
  z-index: 2;

  display: flex;
  justify-content: center;
  align-content: center;

  width: 32px;
  height: 32px;

  padding: 5px;

  background: var(--background-color);

  border-style: solid;
  border-width: 1px;
  border-color: ${colors.barelyVisible};
  border-bottom-color: transparent;
  border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;

  transform-origin: center bottom;
`;

export const InfoBlock = styled.div`
  position: relative;
  z-index: 1;

  width: 240px;
  padding: ${spacings.lg};

  background: var(--background-color);
  border: 1px solid ${colors.barelyVisible};
  border-radius: ${borderRadius.md};

  box-shadow: var(--menu-shadow, var(--modal-shadow, 0 8px 24px rgb(0 0 0 / 16%)));
`;

export const Button = styled(animated.button)`
  position: relative;
  z-index: 5;

  ${editorButton}
  width: var(--c-size-control-md);
  height: var(--c-size-control-md);
  padding: 0;
  background: transparent;
  border-color: transparent;

  svg {
    fill: ${colors.barelyVisible};
  }
`;

export const FavoriteButtonWrapper = styled.div`
  position: absolute;
  top: var(--c-spacing-md);
  right: calc(var(--c-spacing-md) + var(--c-size-control-md) + 4px);
  z-index: 3;

  background: none;
  border: none;

  display: flex;
  justify-content: center;
  align-content: center;

  &:not(.active) {
    ${PopUpWrapper} {
      pointer-events: none;
    }
  }
`;
