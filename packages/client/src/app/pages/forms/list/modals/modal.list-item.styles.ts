import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 6px 4px 6px 12px;
  border-top: 1px solid var(--hairline-color, ${colors.hr});
  background: var(--modal-bg, ${colors.white});
  color: ${colors.gray700};
  cursor: grab;
  transition: background-color 150ms;

  > .form-grip { width: 12px; height: 12px; fill: currentColor; color: ${colors.gray400}; opacity: .6; flex-shrink: 0; }
  &:hover { background: ${colors.gray050}; }
  &.is-drag-placeholder { opacity: .25; }
  &.is-drag-chosen { cursor: grabbing; }
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

export const FormColor = styled.span<{ $color: string }>`
  position: absolute;
  inset-inline-start: 0;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 2px;
  background: ${({ $color }) => $color || colors.gray300};
`;

export const Name = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
`;

export const MoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 4px;
  padding: 0;
  color: ${colors.gray500};
  background: transparent;
  cursor: pointer;
  svg { width: 18px; height: 18px; }
  &:hover, &[aria-expanded=true] { background: ${colors.gray100}; }
  &:disabled { opacity: .4; cursor: default; }
  @media (pointer: coarse) { width: 44px; height: 44px; }
`;

export const MoveMenu = styled.div`
  z-index: 1100;
  box-sizing: border-box;
  min-width: 190px;
  max-width: min(320px, calc(100vw - 24px));
  max-height: min(360px, calc(100vh - 24px));
  overflow: auto;
  padding: 5px;
  border: 1px solid ${colors.gray200};
  border-radius: 6px;
  background: var(--modal-bg, ${colors.white});
  color: ${colors.gray700};
  box-shadow: 0 6px 20px rgb(0 0 0 / 15%);
  > span { display: block; padding: 6px 9px; font-size: 12px; color: ${colors.gray500}; }
`;

export const MoveChoice = styled.button`
  display: block;
  width: 100%;
  padding: 8px 9px;
  border: 0;
  border-radius: 4px;
  text-align: start;
  overflow-wrap: anywhere;
  background: transparent;
  color: inherit;
  cursor: pointer;
  &:hover, &:focus-visible { background: ${colors.gray100}; }
  @media (pointer: coarse) { min-height: 44px; }
`;
