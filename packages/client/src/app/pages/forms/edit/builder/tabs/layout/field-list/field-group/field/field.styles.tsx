import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Wrapper = styled.div`
  cursor: pointer;

  display: flex;
  gap: 6px;
  align-items: center;

  box-sizing: border-box;
  min-width: 0;
  height: 30px;

  padding: 0 6px;
  overflow: hidden;

  background: var(--c-surface-default);
  border: 1px solid var(--c-color-neutral-border-quiet);
  border-radius: var(--c-radius-sm);

  font-size: 12px;

  transition: background-color 120ms ease-out, border-color 120ms ease-out;

  &:hover {
    border-color: var(--c-color-neutral-border-normal);
    background-color: var(--c-color-neutral-fill-quiet);
  }
`;

export const Name = styled.span`
  flex: 1;
  line-height: 14px;

  overflow-x: hidden;
  overflow-y: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const Icon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex-shrink: 0;
  flex-basis: 18px;

  svg {
    fill: currentColor;
    max-width: 18px;
    max-height: 18px;
  }

  color: ${colors.gray500};
`;
