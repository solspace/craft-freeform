import { SlideoutFooter } from "@components/slideouts/slideout.styles";
import { scrollBar } from "@ff-client/styles/mixins";
import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const HeadingCopy = styled.div`
  min-width: 0;
  p { margin: 5px 0 0; color: ${colors.gray500}; font-size: 13px; }
`;

export const ManagerWrapper = styled.div`
  flex: 1;
  min-height: 0;
  padding: 22px ${spacings.lg};
  overflow: auto;
  background: var(--c-surface-default, ${colors.white});
  ${scrollBar};
  @container (max-width: 480px) { padding: 16px 12px; }
`;

export const GroupToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  > span { font-size: 13px; color: ${colors.gray500}; }
`;

export const GroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const GroupLayout = styled.section`
  min-width: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--hairline-color, ${colors.hr});
  &.is-drag-placeholder { opacity: .25; }
`;

export const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 44px;
  margin-bottom: 3px;
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  padding: 6px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: ${colors.gray500};
  cursor: pointer;
  svg { display: block; width: 16px; height: 16px; }
  &.group-handle svg, &.group-rename svg { fill: currentColor; }
  &.group-handle { cursor: grab; color: ${colors.gray400}; }
  &.group-handle:active { cursor: grabbing; }
  &:hover { background: ${colors.gray100}; color: ${colors.gray700}; }
  &.group-remove:hover { background: ${colors.red050}; color: ${colors.red600}; }
  &:disabled { opacity: .4; cursor: default; }
  @media (pointer: coarse) { width: 44px; height: 44px; }
`;

export const GroupName = styled.button`
  flex: 1;
  min-width: 0;
  padding: 4px 0;
  border: 0;
  background: transparent;
  text-align: start;
  font-size: 16px;
  font-weight: 600;
  overflow-wrap: anywhere;
  color: ${colors.gray700};
  cursor: text;
  &:disabled { cursor: default; }
`;

export const GroupNameInput = styled.input`
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: 5px 7px;
  font: inherit;
`;

export const Count = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 23px;
  height: 23px;
  padding-inline: 6px;
  border-radius: 12px;
  font-size: 12px;
  color: ${colors.gray500};
  background: ${colors.gray050};
`;

export const GroupItemWrapper = styled.div`
  min-height: 12px;
  margin-inline-start: 37px;
  padding-inline: 4px;
  border-radius: 5px;
  transition: background-color 150ms, box-shadow 150ms;
  &.is-drop-target {
    background: var(--gray-100, #e4edf6);
    box-shadow: inset 0 0 0 2px var(--link-color, #1f5fea);
  }
  @container (max-width: 480px) { margin-inline-start: 0; }
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

export const Empty = styled.p`
  margin: 0;
  padding: 16px 12px;
  border: 1px dashed ${colors.gray200};
  border-radius: 5px;
  background: ${colors.gray050};
  color: ${colors.gray500};
  font-size: 13px;
  text-align: center;
  pointer-events: none;
`;

export const UnassignedGroup = styled.section`
  margin-top: 16px;
  padding: 7px 10px 10px;
  background: ${colors.gray050};
  border-radius: 7px;
  ${GroupItemWrapper} { margin-top: 6px; }
  ${Count} { background: var(--c-surface-default, ${colors.white}); }
`;

export const UnassignedToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 36px;
  padding: 3px 4px;
  border: 0;
  text-align: start;
  background: transparent;
  color: ${colors.gray700};
  cursor: pointer;
  > span:nth-child(2) { flex: 1; font-weight: 600; }
  > span:first-child { font-size: 16px; transition: transform 150ms; }
  &[aria-expanded=true] > span:first-child { transform: rotate(90deg); }
  @media (pointer: coarse) { min-height: 44px; }
  @media (prefers-reduced-motion: reduce) { > span:first-child { transition: none; } }
`;

export const Confirmation = styled.div`
  margin: 4px 4px 10px 37px;
  padding: 12px;
  border: 1px solid var(--error-color, ${colors.red600});
  border-radius: 6px;
  background: ${colors.red050};
  p { margin: 0 0 10px; color: ${colors.gray700}; }
  > div { display: flex; flex-wrap: wrap; gap: 8px; }
  @container (max-width: 480px) { margin-inline-start: 0; }
`;

export const Feedback = styled.span`
  flex: 1;
  font-size: 13px;
  color: ${colors.gray500};
`;

export const ManagerFooter = styled(SlideoutFooter)`
  .btn:disabled { opacity: .45; cursor: default; }
`;

export const ErrorBlock = styled.div`
  margin-bottom: 14px;
  color: var(--error-color, ${colors.red600});
`;
