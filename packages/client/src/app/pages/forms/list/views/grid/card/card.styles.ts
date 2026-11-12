import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const CardBody = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: ${spacings.xl} ${spacings.xl} 0;
`;

export const FormBody = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${spacings.md};
  width: 100%;
`;

export const FormIdentity = styled.div<{
  $hasBadge: boolean;
  $hasMenu: boolean;
  $hasMonitor: boolean;
}>`
  flex: 1;
  min-width: 0;
  --card-title-end-space: ${({ $hasBadge, $hasMenu }) => ($hasMenu ? 28 : 0) + ($hasBadge ? 28 : 0) + ($hasBadge && $hasMenu ? 4 : 0) + ($hasBadge || $hasMenu ? 12 : 0)}px;
  --card-header-end-space: ${({ $hasMonitor }) => ($hasMonitor ? "0px" : "var(--card-title-end-space)")};
  h2 { padding-inline-end: var(--card-header-end-space); }
  [data-card-description] { max-width: calc(100% - var(--card-header-end-space)); }
  @media (pointer: coarse) {
    --card-title-end-space: ${({ $hasBadge, $hasMenu }) => ($hasMenu ? 44 : 0) + ($hasBadge ? 28 : 0) + ($hasBadge && $hasMenu ? 8 : 0) + ($hasBadge || $hasMenu ? 12 : 0)}px;
  }

`;

export const FormBodyContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const FMContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 34%;
  min-width: 110px;
  overflow-wrap: anywhere;
  text-align: right;
  margin-top: 6px;
  &.corner-monitor { padding-top: 24px; box-sizing: border-box; }
`;

export const Title = styled.h2`
  cursor: default;
  margin: 0 0 ${spacings.xs} 0;
  color: light-dark(#3d464e, ${colors.text});
  font-size: 20px;
  line-height: 24px;
  padding-inline-end: 26px;
  box-sizing: border-box;
  font-weight: 700;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: calc(100% - 1px);
  max-width: calc(100% - 1px);
  transition: all 0.2s ease-out;
`;

export const TitleLink = styled(Title)`
  cursor: pointer;
`;

export const Subtitle = styled.span`
  display: block;
  color: light-dark(#868f96, ${colors.muted});
  font-size: 14px;
  line-height: 1.4;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: ${spacings.sm};
  cursor: default;

  &:hover {
    color: light-dark(#6f7a82, ${colors.text});
  }
`;

export const Controls = styled.div`
  --card-corner-size: 28px;
  flex-shrink: 0;
  position: absolute;
  right: 22px;
  top: 0;
  height: 72px;
  z-index: 2;

  display: flex;
  justify-content: end;
  align-items: center;
  gap: 4px;
  > button { width: 28px; height: 28px; }
  > span[aria-hidden='true'] {
    flex: 0 0 var(--card-corner-size);
    width: var(--card-corner-size);
    height: var(--card-corner-size);
    border: 0;
    border-radius: 0;
    background: transparent;
  }
  > span[aria-hidden='true'] svg { width: 22px; height: 22px; }
  &:not(:has(> span[aria-hidden='true'])) { right: ${spacings.xl}; }
  @media (pointer: coarse) {
    gap: 8px;
    > button { width: 44px; height: 44px; }
  }
`;

export const ControlButton = styled.button`
  appearance: none;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: var(--c-radius-md);
  font-size: 14px;
  color: var(--c-text-quiet);
  background: transparent;
  cursor: pointer;
  &:hover:not([aria-disabled=true]), &[aria-expanded=true] {
    color: var(--c-color-neutral-on-quiet);
    background: var(--c-color-neutral-fill-quiet);
  }
  &:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
  }


  > svg {
    display: block;
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
  &:disabled, &[aria-disabled=true] { opacity: .45; cursor: default; }
  @media (pointer: coarse) { width: 44px; height: 44px; }
`;

export const LinkList = styled.ul`
  margin: ${spacings.sm} 0 0;
  padding: 0;
`;

export const CardWrapper = styled.li`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  box-sizing: border-box;
  grid-column: span 1;
  grid-row: span 1;

  &[data-card-size='2x1'], &[data-card-size='2x2'] { grid-column: span 2; }
  &[data-card-size='2x1'] ${LinkList}, &[data-card-size='2x2'] ${LinkList} {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 18px;
  }
  &[data-card-size='1x2'], &[data-card-size='2x2'] { grid-row: span 2; }
  @container form-card-grid (width < 658px) {
    &[data-card-size] { grid-column: span 1; }
  }

  &[data-card-size='1x2'] ${FormBody} { flex-direction: column; }
  &[data-card-size='1x2'] ${FormIdentity} { --card-header-end-space: var(--card-title-end-space); }
  &[data-card-size='1x2'] ${FMContainer} { width: 100%; margin-top: 0; &.corner-monitor { padding-top: 0; } }
  @container form-card-grid (width < 400px) {
    ${FormBody} { flex-wrap: wrap; }
    ${FormIdentity} { --card-header-end-space: var(--card-title-end-space); }
    ${FMContainer} { width: 100%; min-width: 0; margin-top: 0; &.corner-monitor { padding-top: 0; } }
  }

  overflow: hidden;
  &:focus-visible { outline: 2px solid var(--link-color); outline-offset: 2px; }

  background-color: color-mix(in srgb, var(--c-surface-sunken) 25%, var(--c-surface-default));
  border: 1px solid light-dark(#dfe6ee, ${colors.border});
  box-shadow: 0 1px 3px #1f344508;
  border-radius: var(--large-border-radius);

  opacity: 1;
  pointer-events: auto;

  transition:
    background-color 0.2s ease-out,
    border-color 0.2s ease-out,
    box-shadow 0.2s ease-out;

  &.blurred {
    filter: blur(3px);
    opacity: 0.35;
    pointer-events: none;
    user-select: none;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.card-drag-preview { box-shadow: 0 10px 28px #1f344536; cursor: grabbing; }

  &.archived {
    opacity: 0;
  }

  &:not(.dragging):hover, &:focus-within {
    background-color: color-mix(in srgb, var(--c-surface-sunken) 10%, var(--c-surface-default));
    border-color: ${colors.border};
    box-shadow: 0 3px 12px #1f344510;

    ${TitleLink} {
      color: var(--link-color);
    }

    ${Controls} {
      opacity: 1;
      transform: translateY(0);
      > * { opacity: 1; pointer-events: auto; }
    }
  }
`;

export const ChartWrapper = styled.div`
  flex-shrink: 0;
  margin-top: auto;
  min-width: 0;
  [data-card-size='1x2'] &, [data-card-size='2x2'] & { margin-top: 0; }
`;

export const ChartLabel = styled.div`
  padding: 0 ${spacings.xl} 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  line-height: 18px;
  color: light-dark(#687684, ${colors.muted});
`;

export const ExpandedStats = styled.dl`
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
  margin: 12px ${spacings.xl} 0;
  dt { font-size: 12px; line-height: 16px; color: light-dark(#687684, ${colors.muted}); }
  dd { margin: 2px 0 0; font-size: 22px; line-height: 26px; font-weight: 600; font-variant-numeric: tabular-nums; }
  @container form-card-grid (width < 658px) {
    [data-card-size='2x1'] & { display: none; }
  }
`;

export const Activity = styled.section`
  flex-shrink: 1;
  min-height: 0;
  overflow: auto;
  margin: 12px ${spacings.xl};
  padding-top: 12px;
  border-top: 1px solid light-dark(#dfe6ee, ${colors.border});
  h3 { margin: 0 0 8px; font-size: 13px; line-height: 18px; font-weight: 600; }
  p { margin: 8px 0; font-size: 12px; color: light-dark(#687684, ${colors.muted}); }
  button { text-decoration: underline; color: var(--link-color); }
  ul { list-style: none; padding: 0; margin: 0; }
  li { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 4px 6px; padding: 2px 0; font-size: 12px; line-height: 18px; }
  .status.submission-status { flex: 0 0 6px; width: 6px; height: 6px; min-width: 6px; min-height: 6px; align-self: center; margin: 0; border-radius: 50%; }
  .activity-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
  .activity-heading h3 { margin: 0; }
  li a, .field-option { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  time { flex-shrink: 0; white-space: nowrap; }
  .status-summary { display: flex; gap: 6px 12px; flex-wrap: wrap; font-size: 12px; color: light-dark(#687684, ${colors.muted}); }
  .status-summary h3 { width: 100%; color: light-dark(#3f4d5a, ${colors.text}); }
  .status-summary strong { color: light-dark(#3f4d5a, ${colors.text}); font-variant-numeric: tabular-nums; }
  .field-average { font-size: 12px; color: light-dark(#687684, ${colors.muted}); }
  .field-average > strong { font-size: 22px; color: light-dark(#3f4d5a, ${colors.text}); }
  &.compact-details { margin-top: auto; padding-top: 6px; border-top: 0; }
  &.compact-details h3 { margin-bottom: 2px; font-size: 12px; }
  time { color: light-dark(#687684, ${colors.muted}); font-variant-numeric: tabular-nums; }
  dl { margin: 0; font-size: 12px; }
  dt { color: light-dark(#687684, ${colors.muted}); margin-top: 8px; }
  dd { margin: 0; overflow-wrap: anywhere; }
`;

export const SizeMenu = styled.div.attrs({ className: "menu visible" })`
  z-index: 1100;
  box-sizing: border-box;
  width: 240px;
  max-width: calc(100vw - 24px);
  font-size: var(--c-text-base);
  line-height: var(--c-leading-normal);
  .menu-controls { border: 0; margin: 0; padding: 0; min-inline-size: 0; }
  .menu-controls:disabled { opacity: .65; }
  .content-options, .card-actions { border-top: 1px solid var(--c-color-neutral-border-quiet); margin-top: var(--c-spacing-xs); padding-top: var(--c-spacing-xs); }
  .card-actions:first-child { border-top: 0; margin-top: 0; padding-top: 0; }
  .content-options { padding: var(--c-spacing-sm); }
  label { display: block; font-size: var(--c-text-sm); margin-bottom: var(--c-spacing-sm); }
  p { font-size: var(--c-text-xs); color: var(--c-text-quiet); margin: var(--c-spacing-xs) 0 0; }
  .card-actions button { justify-content: flex-start; }
  .card-actions svg { width: 16px; height: 16px; flex-shrink: 0; display: block; fill: currentColor; }
  > span, .menu-controls > span { display: block; padding: var(--c-spacing-sm); font-size: var(--c-text-sm); color: var(--c-text-quiet); }
`;

export const SizeChoice = styled.button.attrs({ className: "menu-item" })`
  justify-content: space-between;
  flex-wrap: nowrap;
  &:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: calc(-1 * var(--c-focus-outline-width));
  }
  .size-label { display: inline-flex; align-items: center; gap: var(--c-spacing-sm); }
  .size-check { display: block; width: 14px; height: 14px; flex-shrink: 0; }
  @media (pointer: coarse) { min-height: 44px; }
`;

export const PaddedChartFooter = styled.div<{ $color: string }>`
  margin-top: -3px;

  background-color: ${({ $color }) => $color};
  opacity: 0.3;

  height: 5px;

  font-size: 0px;
  line-height: 0px;

  overflow: hidden;
`;
export const ChangeArrow = styled.span<{ $up: boolean }>`
  color: light-dark(${({ $up }) => ($up ? "#218739" : "#c23c3c")}, ${({ $up }) => ($up ? "var(--fg-success, #218739)" : "var(--fg-error, #c23c3c)")});
  display: inline-block;
  line-height: 1;
  vertical-align: baseline;
`;
export const ComparisonValue = styled.span<{ $muted: boolean }>`
  ${({ $muted }) => $muted && "font-size: 13px; font-weight: 400; color: var(--light-text-color);"}
  .stat-placeholder { display: inline-block; width: 52px; height: 12px; border-radius: 4px; background: var(--ui-control-bg-color); vertical-align: middle; }
`;
