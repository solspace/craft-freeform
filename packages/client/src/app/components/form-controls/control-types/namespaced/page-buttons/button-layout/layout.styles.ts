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
  background: light-dark(${colors.white}, ${colors.surface});
  font-size: 10px;
  font-weight: 400;
  line-height: 14px;

  svg { width: 12px; height: 12px; flex: 0 0 12px; }
  > span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  &.submit {
    border-color: var(--secondary-button-bg, ${colors.gray600});
    background: light-dark(${colors.gray600}, var(--secondary-button-bg, ${colors.gray600}));
    color: light-dark(${colors.white}, var(--secondary-button-text-color, ${colors.white}));
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
  background: light-dark(${colors.white}, ${colors.surface});
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;

  .layout-preview {
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
  }
  input { position: static; flex: 0 0 14px; width: 14px; height: 14px; box-sizing: border-box; margin: 0; accent-color: light-dark(var(--teal-600, #0d9488), var(--ui-control-selected-border, ${colors.link})); }
  &:hover { border-color: ${colors.muted}; }
  &:has(input:checked) {
    border-color: light-dark(${colors.gray300}, var(--ui-control-selected-border, ${colors.link}));
    background: light-dark(#e4e7eb, var(--ui-control-selected-bg, var(--bg-selection-light, #e4e7eb)));
    color: light-dark(${colors.text}, var(--ui-control-selected-color, ${colors.text}));
    box-shadow: none;
  }
  &:has(input:focus-visible) { outline: 2px solid light-dark(#397fbe, ${colors.link}); outline-offset: 2px; }
`;
