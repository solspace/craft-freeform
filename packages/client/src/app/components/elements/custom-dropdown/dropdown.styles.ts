import { dropdownControl } from "@ff-client/styles/craft6";
import { scrollBar } from "@ff-client/styles/mixins";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--c-spacing-md);
  min-width: 0;
`;

export const Search = styled.input`
  ${dropdownControl};
  width: 100%;
  flex: 1;
  min-width: 0;
  padding: var(--c-spacing-sm) var(--c-input-spacing-inline);
`;

export const ListWrapper = styled.div`
  max-height: 300px;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;

  ${scrollBar};
`;

export const CurrentValue = styled.div`
  ${dropdownControl};
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: start;
  align-items: center;
  gap: var(--c-spacing-sm);
  padding: 0 calc(var(--c-input-spacing-inline) * 1.5 + 1em) 0 var(--c-input-spacing-inline);

  &.missing {
    color: var(--yellow-800, #854d0e);
    background-color: var(--yellow-100, #fef3c7);

    svg {
      fill: currentColor;
    }
  }

  &.empty > span {
    color: var(--c-text-quiet);
    font-style: italic;
  }

  &.disabled {
    opacity: 0.5;
    cursor: wait;
  }

  > span {
    min-height: 20px;
  }

  > .ff-recommended-badge { min-height: 0; margin-inline-start: auto; }
  &:after {
    content: '';
    position: absolute;
    top: calc(50% - 5px);
    inset-inline-end: var(--c-input-spacing-inline);

    display: block;
    width: 7px;
    height: 7px;

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
  display: flex;
  flex-direction: column;
  gap: var(--c-spacing-sm);
  max-height: calc(100dvh - 16px);
  box-sizing: border-box;

  background-color: var(--c-surface-overlay);
  color: var(--c-text-default);
  border: 1px solid var(--c-color-neutral-border-quiet);
  border-radius: var(--c-radius-md);
  box-shadow: var(--c-shadow-sm);
  padding: var(--c-spacing-md);

  overflow: hidden;
  z-index: 1000;
`;

export const CloseButton = styled.button.attrs({ type: "button" })`
  position: static;
  flex: 0 0 var(--c-size-control-md);

  display: flex;
  justify-content: center;
  align-items: center;

  width: var(--c-size-control-md);
  height: var(--c-size-control-md);
  color: var(--c-text-default);
  background: transparent;
  border: 0;
  border-radius: var(--c-radius-sm);
  padding: 0;
  box-sizing: border-box;

  > svg { width: 16px; height: 16px; }

  cursor: pointer;

  &:hover {
    background-color: var(--c-color-neutral-fill-quiet);
  }

  &:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
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
