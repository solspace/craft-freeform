import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Wrapper = styled.div`
  cursor: pointer;

  display: flex;
  gap: 6px;
  align-items: center;

  height: 28px;

  padding: 0 4px;
  overflow: hidden;

  background: light-dark(${colors.white}, ${colors.surface});
  border: 1px solid light-dark(${colors.gray100}, var(--medium-hairline-color));
  border-radius: 3px;

  font-size: 12px;

  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    border-color: ${colors.inputBorder};
    background-color: light-dark(${colors.gray050}, var(--ui-control-hover-bg-color, ${colors.gray050}));
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
