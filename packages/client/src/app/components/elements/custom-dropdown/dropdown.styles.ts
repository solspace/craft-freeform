import { dropdownControl } from "@ff-client/styles/craft6";
import { scrollBar } from "@ff-client/styles/mixins";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const Search = styled.input`
  ${dropdownControl};
  width: 100%;
  padding: var(--c-spacing-sm) 30px var(--c-spacing-sm) var(--c-input-spacing-inline);
`;

export const ListWrapper = styled.div`
  max-height: 300px;
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

  background-color: var(--c-surface-overlay);
  color: var(--c-text-default);
  border: 1px solid var(--c-color-neutral-border-quiet);
  border-radius: var(--c-radius-md);
  box-shadow: var(--c-shadow-sm);
  padding: var(--c-spacing-sm);

  overflow: hidden;
  z-index: 1000;
`;

export const CloseButton = styled.button`
  position: absolute;
  inset-block-start: var(--c-spacing-sm);
  inset-inline-end: var(--c-spacing-sm);

  display: flex;
  justify-content: center;
  align-items: center;

  width: 30px;
  height: var(--c-size-control-md);
  color: var(--c-text-default);

  cursor: pointer;

  &:hover {
    background-color: var(--c-color-neutral-fill-normal);
  }
`;

export const DropdownWrapper = styled.div`
  position: relative;

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
  align-items: center;

  width: 16px;
  height: 16px;

  svg {
    width: 16px !important;
    height: 16px !important;
  }
`;

export const OptionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;

  svg {
    width: 16px !important;
    height: 16px !important;
  }
`;
