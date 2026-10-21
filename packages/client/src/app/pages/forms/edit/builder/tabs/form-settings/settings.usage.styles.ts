import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const UsageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-width: 1440px;
  margin: 0 auto;
  min-width: 0;

  h2 { margin: 0; font-size: 16px; line-height: 24px; }
  h3 { margin: 0 0 10px; font-size: 14px; }
  p { margin: 4px 0 0; }
  .muted { color: ${colors.gray500}; font-size: 13px; line-height: 20px; }
  .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
  .count { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; padding: 0 6px; border-radius: 5px; background: ${colors.gray100}; font-size: 12px; font-weight: 600; }
  .heading-label { display: flex; align-items: center; gap: 8px; }
  .error { margin: 0; }
`;

export const UsageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  h1 { padding: 0; }
  .copy-action { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 34px; white-space: nowrap; }
  .btn i { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; line-height: 1; }
`;

export const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;

  .metric-card {
    --metric-accent: #277eb5;
    --metric-tint: #edf6fc;
    display: grid;
    position: relative;
    container-type: inline-size;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    min-height: 74px;
    padding: 8px 10px;
    border: 1px solid ${colors.gray200};
    border-radius: 6px;
    box-sizing: border-box;
  }
  .metric-card[data-tone='amber'] { --metric-accent: #b3782d; --metric-tint: #fcf4e8; }
  .metric-card[hidden] { display: none; }
  .metric-card[data-tone='violet'] { --metric-accent: #7962ba; --metric-tint: #f3effb; }
  .metric-card[data-tone='teal'] { --metric-accent: #248d82; --metric-tint: #eaf7f4; }
  .metric-card[data-tone='rose'] { --metric-accent: #b25a7a; --metric-tint: #fbedf2; }
  .metric-card[data-tone='slate'] { --metric-accent: #63748d; --metric-tint: #eef2f8; }
  .metric-details { min-width: 0; }
  .metric-label { display: block; color: ${colors.gray700}; font-size: 15px; font-weight: 600; line-height: 20px; overflow-wrap: anywhere; }
  .metric-details .muted { margin: 0; font-size: 12px; line-height: 18px; }
  .metric-review { color: ${colors.link}; text-decoration: none; }
  .metric-review:hover, .metric-review:focus-visible { text-decoration: underline; }
  .metric-icon {
    position: absolute;
    top: -10px;
    right: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 7px;
    color: var(--metric-accent);
    background: var(--metric-tint);
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 2%);
  }
  .metric-icon i { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; font-size: 14px; line-height: 1; }

  @media (min-width: 1751px) {
    &[data-rules-hidden='true'] { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  }
  @media (max-width: 1750px) { grid-template-columns: repeat(3, minmax(0, 1fr)); row-gap: 20px; }
  @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 520px) { grid-template-columns: minmax(0, 1fr); }
`;

export const MetricValue = styled.strong<{ $length: number }>`
  font-size: clamp(20px, calc((100cqi - 104px) * ${({ $length }) => 1.8 / Math.max(1, $length)}), 42px);
  line-height: 50px;
  font-weight: 600;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

export const UsagePanel = styled.section`
  border: 1px solid ${colors.gray200};
  border-radius: 6px;
  padding: 18px 20px;
  min-width: 0;

  .chart { position: relative; width: 100%; height: 200px; }
  .chart[data-loading="true"] canvas { opacity: 0.35; }
  .chart-controls { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px 18px; margin-left: auto; }
  .chart-period { flex-shrink: 0; }
  .chart-period select { min-height: 28px; font-size: 12px; line-height: 20px; }
  .chart-empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 16px; text-align: center; pointer-events: none; }
  .chart-empty[hidden] { display: none; }
  .chart-empty > span { padding: 6px 10px; border-radius: 4px; background: ${colors.white}; }
  .chart-footnote.muted, .panel-footnote.muted {
    margin-top: 12px;
    color: ${colors.gray400};
    font-size: 12px;
    font-style: italic;
    line-height: 18px;
  }
  .legend { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 12px; }
  .field-type-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .type-chip { display: inline-flex; align-items: center; gap: 8px; min-height: 28px; padding: 2px 9px; border-radius: 4px; background: ${colors.gray050}; font-size: 12px; }
  .type-chip b { font-variant-numeric: tabular-nums; }
  &.usage-elements-panel { padding: 14px 16px; }
  &.usage-elements-panel .section-heading { margin-bottom: 10px; }
  &.usage-elements-panel .count { min-width: 20px; height: 20px; padding: 0 5px; font-size: 11px; }
  &.usage-elements-panel[data-empty="true"] .section-heading { justify-content: flex-start; gap: 6px 16px; margin-bottom: 0; }
  .usage-empty.muted { margin: 0; font-size: 12px; line-height: 18px; }
  .element-table { overflow-x: auto; border: 1px solid ${colors.gray200}; border-radius: 5px; }
  .usage-elements-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
  .usage-elements-table th, .usage-elements-table td { padding: 6px 10px; vertical-align: middle; }
  .usage-elements-table thead { background: ${colors.gray050}; color: ${colors.gray500}; }
  .usage-elements-table thead th { font-size: 12px; font-weight: 600; line-height: 20px; }
  .usage-elements-table thead th:first-child { width: 60%; }
  .usage-elements-table thead th:not(:first-child) { width: 20%; }
  .usage-elements-table tbody tr { border-top: 1px solid ${colors.hairline}; }
  .usage-elements-table tbody th { font-weight: 500; }
  .usage-elements-table tbody td { color: ${colors.gray600}; }
  .usage-element.chip { margin: 0; padding: 0; min-height: 22px; height: 22px; max-width: 100%; border: 0; background: transparent; box-shadow: none; }
  .usage-element.chip::before { display: none; }
  .usage-element .chip-content { display: flex; align-items: center; min-height: 22px; padding: 0; }
  .usage-element .label-link { color: ${colors.link}; line-height: 20px; }
  .usage-status { display: inline-flex; align-items: center; gap: 6px; min-height: 22px; padding: 0 7px; border-radius: 4px; background: ${colors.gray050}; font-size: 12px; line-height: 18px; white-space: nowrap; }
  .usage-status .status { width: 8px; height: 8px; margin: 0; flex-shrink: 0; }

`;

export const DiagnosticsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 18px;

  > section { display: flex; flex-direction: column; padding: 14px 16px; }
  .section-heading { margin-bottom: 10px; }
  .section-heading .muted { margin-top: 2px; font-size: 12px; line-height: 18px; }
  dl { display: grid; grid-template-columns: minmax(0, 1fr); margin: 0; }
  dl > div { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; min-width: 0; padding: 6px 0; border-bottom: 1px solid ${colors.hairline}; font-size: 12px; line-height: 18px; }
  .diagnostics-details > div:last-child { border-bottom: 0; }
  dt { flex-shrink: 0; max-width: 55%; color: ${colors.gray500}; }
  dd { min-width: 0; margin: 0; text-align: right; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
  code { font-size: 11px; }
  .configuration-section { margin-top: 10px; }
  .configuration-counts { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 24px; }
  .configuration-counts h3 { margin: 0; }
  .section-heading + .configuration-section { margin-top: 0; }
  h3 { display: flex; align-items: center; gap: 7px; margin: 0 0 6px; font-size: 12px; font-weight: 600; line-height: 18px; }
  .count { min-width: 20px; height: 20px; padding: 0 5px; font-size: 11px; }
  .configuration-status-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px 10px; margin-bottom: 6px; }
  .configuration-status-heading h3 { margin: 0; }
  .configuration-status-toggle { display: inline-flex; align-items: center; min-height: 22px; padding: 0; border: 0; border-radius: 2px; background: transparent; color: ${colors.link}; font: inherit; font-size: 11px; line-height: 18px; white-space: nowrap; cursor: pointer; }
  .configuration-status-toggle:hover { text-decoration: underline; }
  .configuration-status-toggle:focus-visible { outline: 2px solid ${colors.link}; outline-offset: 2px; }
  .configuration-status-list, .field-type-list { display: flex; flex-wrap: wrap; gap: 4px; }
  .configuration-status-dot.status { flex: 0 0 6px; width: 6px; height: 6px; margin: 0; }
  .configuration-status-chip { max-width: 100%; }
  .configuration-status-name { min-width: 0; overflow-wrap: anywhere; }
  .configuration-status-type { flex-shrink: 0; font-weight: 600; white-space: nowrap; }
  .configuration-status-type + .configuration-status-name { padding-inline-start: 6px; border-inline-start: 1px solid ${colors.gray200}; color: ${colors.gray500}; font-size: 10px; line-height: 16px; }
  .type-chip { gap: 6px; min-height: 22px; padding: 1px 7px; font-size: 11px; line-height: 18px; }
  .panel-footnote.muted { margin-top: auto; padding-top: 12px; }

  @media (max-width: 1200px) { grid-template-columns: minmax(0, 1fr); }
`;
