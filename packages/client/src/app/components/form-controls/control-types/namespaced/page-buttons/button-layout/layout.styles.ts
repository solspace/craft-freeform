import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const AlignmentControl = styled.div`
  width: 100%;
  > [role="group"] { padding-top: 0; }
`;

export const OrderControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 16px;
  width: 100%;
`;

export const OrderLabel = styled.div`
  color: ${colors.gray550};
  font-size: 14px;
  font-weight: 700;
`;

export const ButtonLayoutWrapper = styled.div`
  display: grid;
  gap: 7px;
`;

export const ButtonGroup = styled.span`
  display: flex;
  gap: 3px;
  min-width: 0;
`;

// These are miniature previews, rather than interactive buttons inside a control.
export const Button = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  height: 25px;
  padding: 0 6px;
  box-sizing: border-box;
  border: 1px solid ${colors.gray300};
  border-radius: 4px;
  color: ${colors.gray600};
  background: ${colors.surface};
  font-size: 10px;
  font-weight: 400;
  line-height: 14px;

  svg { width: 12px; height: 12px; flex: 0 0 12px; }
  > span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  &.submit {
    border-color: var(--secondary-button-bg, ${colors.gray600});
    background: var(--secondary-button-bg, ${colors.gray600});
    color: var(--secondary-button-text-color, ${colors.white});
  }
`;

export const LayoutBlock = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  margin: 0;
  padding: 10px;
  border: 1px solid ${colors.gray200};
  border-radius: 6px;
  background: ${colors.surface};
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;

  .layout-preview {
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
  }
  input { position: static; flex: 0 0 14px; width: 14px; height: 14px; box-sizing: border-box; margin: 0; accent-color: var(--ui-control-selected-border, ${colors.link}); }
  &:hover { border-color: ${colors.muted}; }
  &:has(input:checked) {
    border-color: var(--ui-control-selected-border, ${colors.link});
    background: var(--ui-control-selected-bg, var(--bg-selection-light, #edf5fc));
    color: var(--ui-control-selected-color, ${colors.text});
    box-shadow: inset 0 0 0 1px var(--ui-control-selected-border, ${colors.link});
  }
  &:has(input:focus-visible) { outline: 2px solid ${colors.link}; outline-offset: 2px; }
`;
