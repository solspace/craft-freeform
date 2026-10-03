import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Wrapper = styled.div`
  cursor: pointer;

  display: flex;
  gap: 6px;
  align-items: center;

  height: 28px;

  padding: 0 4px;
  overflow: hidden;

  background: var(--c-surface-default, #fff);
  border: 1px solid var(--c-color-border-quiet);
  border-radius: 3px;

  font-size: 12px;

  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: var(--c-color-neutral-border-loud);
    background-color: var(--c-color-neutral-fill-quiet);
  }
`;

export const Name = styled.span`
  flex: 1;
  line-height: 14px;

  overflow-x: hidden;
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
    max-width: 18px;
    max-height: 18px;
  }

  color: ${colors.gray500};
`;

export const Remove = styled.div`
  color: ${colors.gray500};
  margin-right: ${spacings.xs};
`;
