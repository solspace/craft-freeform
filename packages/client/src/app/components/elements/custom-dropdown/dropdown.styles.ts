import { scrollBar } from "@ff-client/styles/mixins";
import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from "@ff-client/styles/variables";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const Search = styled.input`
  background: ${colors.inputBackground};
  color: ${colors.text};
  &::placeholder { color: ${colors.muted}; opacity: 1; }
  width: 100%;
  padding: 7px 30px 7px 10px;

  border: 0;
  border-bottom: 1px solid ${colors.hairline};
  border-radius: 0;
  box-sizing: border-box;
  height: 34px;

  &:focus,
  &:active,
  &:hover {
    box-shadow: none;
    outline: none;
  }
`;

export const ListWrapper = styled.div`
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;

  ${scrollBar};
`;

export const CurrentValue = styled.div`
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: start;
  align-items: center;
  gap: ${spacings.sm};

  background-color: light-dark(#dfe5ec, ${colors.selectBackground});
  box-shadow: inset 0 0 0 1px ${colors.inputBorder};
  border-radius: ${borderRadius.lg};

  padding: 7px 22px 7px 10px;

  &.missing {
    color: var(--yellow-800, #854d0e);
    background-color: var(--yellow-100, #fef3c7);

    svg {
      fill: currentColor;
    }
  }

  &.empty > span {
    color: light-dark(${colors.gray300}, ${colors.muted});
    font-style: italic;
  }

  > span {
    min-height: 20px;
  }

  > .ff-recommended-badge { min-height: 0; margin-inline-start: auto; }

  &:not(.missing):hover {
    background-color: light-dark(#cdd4de, var(--button-bg--hover, #cdd4de));
  }

  &:after {
    content: '';
    position: absolute;
    top: calc(50% - 5px);
    right: 9px;

    display: block;
    width: 7px;
    height: 7px;

    opacity: 0.8;
    border: solid;
    border-width: 0 2px 2px 0;

    font-size: 0;

    transform: rotate(45deg);

    user-select: none;
    pointer-events: none;
  }
`;

export const SpinnerWrapper = styled.div`
  > svg {
    fill: currentColor;
    width: 20px;
    height: 20px;
  }
`;

export const DropdownRollout = styled(animated.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;

  background-color: light-dark(${colors.gray050}, ${colors.mutedSurface});
  border: 1px solid ${colors.inputBorder};
  border-radius: ${borderRadius.lg};
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
  :root:not([data-dark-mode="dark"]) & {
    box-shadow: ${shadows.container};
  };

  overflow: hidden;
  z-index: 1000;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 30px;
  height: 34px;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${colors.muted};

  cursor: pointer;

  &:hover {
    background-color: light-dark(${colors.gray050}, ${colors.overlay});
  }
`;

export const DropdownWrapper = styled.div`
  position: relative;

  &:focus-visible ${CurrentValue} { box-shadow: var(--focus-ring); }

  &.open {
    ${DropdownRollout} {
      display: block;
    }

    ${CurrentValue} {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;

      &:hover {
        box-shadow: none;
        outline-color: transparent;
      }
    }
  }
`;

export const Icon = styled.span`
  display: flex;
  flex: 0 0 16px;
  align-items: center;

  width: 16px;
  height: 16px;

  > .status { flex: none; margin: 0; }

  svg {
    width: 16px !important;
    height: 16px !important;
  }
`;

export const OptionIcon = styled.div`
  display: flex;
  flex: 0 0 16px;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;

  > .status { flex: none; margin: 0; }

  svg {
    width: 16px !important;
    height: 16px !important;
  }
`;
