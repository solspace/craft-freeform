import styled from "styled-components";

export const RemoveButtonWrapper = styled.button`
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 2;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 28px;
  height: 28px;
  border: 0;
  border-radius: var(--c-radius-sm);
  background: transparent;
  color: var(--c-text-quiet);
  &:hover { background: var(--c-color-danger-fill-quiet); color: var(--c-color-danger-on-quiet); }
  &:focus-visible { outline: 2px solid var(--c-color-focus-outline); outline-offset: 1px; }
  padding: 3px;

  svg {
    width: 20px;
    height: 20px;

    color: currentColor;
  }
`;
