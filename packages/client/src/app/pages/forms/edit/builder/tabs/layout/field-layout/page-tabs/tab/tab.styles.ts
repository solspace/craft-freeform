import { errorAlert } from "@ff-client/styles/mixins";
import { colors } from "@ff-client/styles/variables";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const TabWrapper = styled(animated.div)`
  position: relative;
`;

export const RemoveTabButton = styled.button`
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: var(--c-radius-sm);
  background: transparent;
  color: var(--c-text-quiet);
  opacity: 0;
  pointer-events: none;
  cursor: pointer;
  transition: opacity 160ms ease-out;
  @media (prefers-reduced-motion: reduce) { transition-duration: 0s; }

  &:hover { color: var(--c-color-danger-on-quiet); background: var(--c-color-danger-fill-quiet); }
  &:focus-visible { outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline); outline-offset: 1px; }
  svg { width: 12px; height: 12px; }
`;

export const RemoveTabSlot = styled.div`
  flex: none;
  width: 0;
  margin-inline-start: 0;
  overflow: hidden;
  transition: width 160ms ease-out, margin-inline-start 160ms ease-out;
  @media (prefers-reduced-motion: reduce) { transition-duration: 0s; }
`;

export const TabText = styled.div`
  min-width: 0;
  max-width: 160px;
  display: flex;
  align-items: center;
  gap: 10px;

  > span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

export const PageTab = styled(animated.div)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;
  min-height: var(--c-size-control-md);
  padding: 0 12px;
  transition: padding-inline-end 160ms ease-out;
  @media (prefers-reduced-motion: reduce) { transition-duration: 0s; }
  margin: 0;
  border-radius: var(--c-radius-md);

  color: var(--c-text-quiet);
  border: 1px solid transparent;
  background: transparent;

  overflow: hidden;

  &.active {
    color: var(--c-text-default);
    background: color-mix(in srgb, var(--c-text-default) 6%, transparent);
    font-weight: 600;
  }

  &.errors {
    color: ${colors.error};

    ${errorAlert};
  }

  &.can-drop {
    box-shadow: 0 2px 12px ${colors.gray500};
    transform: scale(1.1);
    z-index: 2;
  }

  &.is-dragging {
    z-index: 1;
  }

  cursor: pointer;
  &:hover:not(.active) { background: color-mix(in srgb, var(--c-text-default) 3%, transparent); }
  &:hover, &:focus-within {
    ${RemoveTabSlot} { width: 20px; margin-inline-start: 6px; }
    ${RemoveTabButton} { opacity: 1; pointer-events: auto; }
  }
  &:hover:has(${RemoveTabSlot}), &:focus-within:has(${RemoveTabSlot}) { padding-inline-end: 6px; }
  &:hover {
    transition-delay: 500ms;
    ${RemoveTabSlot}, ${RemoveTabButton} { transition-delay: 500ms; }
  }
  &:focus-within {
    transition-delay: 0s;
    ${RemoveTabSlot}, ${RemoveTabButton} { transition-delay: 0s; }
  }
`;

export const TabDrop = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;

  width: 100%;
`;

export const Input = styled.input`
  appearance: none;
  field-sizing: content;
  display: block;
  width: auto;
  min-width: 3ch;
  max-width: 160px;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  outline: none;
  box-shadow: none;
  &:focus, &:focus-visible { border: 0; outline: none; box-shadow: none; }
`;
