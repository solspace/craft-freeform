import { Wrapper as InfoBanner } from "@components/notification-blocks/info/info-block.styles";
import { editorButton } from "@ff-client/styles/craft6";
import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const UtilityTrigger = styled.button.attrs({
  type: "button",
  className: "freeform-label-utility-trigger",
})`
  ${editorButton}
  border-color: transparent;
  background: transparent;
  color: var(--c-text-quiet);
  flex: 0 0 auto;
  align-self: center;
  white-space: nowrap;
`;
export const UtilityBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 24px;
  color: ${colors.gray700};
  container-type: inline-size;

  > p:first-child { margin-top: 0; }
  .utility-hint { color: ${colors.gray500}; font-size: 13px; }
  .utility-scope { margin: 24px 0; max-width: 320px; }
  .utility-scope label { display: block; margin-bottom: 6px; font-weight: 600; }
  .utility-scope .cp-select, .utility-scope select { width: 100%; }
  .utility-type-count { color: ${colors.gray500}; }
  ${InfoBanner} { margin-top: 18px; padding: 8px 12px; gap: 8px; font-size: 12px; }
  ${InfoBanner} > svg { width: 16px; height: 16px; }
`;
export const UtilitySection = styled.section`
  padding: 20px 0;
  border-top: 1px solid ${colors.hairline};
  h2 { margin: 0 0 16px; font-size: 16px; }
  .utility-formatting-options { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-top: 12px; }
`;
export const UtilityCheckboxWrapper = styled.div`
  position: relative;
  min-height: 20px;
  label { display: block; margin: 0; font-weight: 400; cursor: pointer; }
  .cp-select + &, .text + & { margin-top: 10px; }
`;
export const UtilityControls = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 18px;

  > div > label { display: block; margin-bottom: 6px; font-weight: 600; }
  .cp-select, select { width: 100%; }
  select { min-height: var(--c-size-control-md); }
  .utility-replace { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
  .utility-replace > div > label { display: block; margin-bottom: 6px; font-weight: 600; }
  .utility-replace input.text { box-sizing: border-box; width: 100%; }
  @container (max-width: 450px) {
    grid-template-columns: 1fr;
    .utility-replace { grid-template-columns: 1fr; }
  }
`;
export const FieldTypeFilter = styled.details`
  padding: 20px 0;
  border-top: 1px solid ${colors.hairline};
  summary { cursor: pointer; font-weight: 600; }
  summary:focus-visible { outline: 2px solid var(--link-color, #3476b8); outline-offset: 4px; border-radius: 2px; }
  .utility-types-summary { color: ${colors.gray500}; font-weight: 400; }
  .utility-types-body { padding-top: 16px; }
  .utility-types-heading { margin-bottom: 14px; }
  .utility-select-types {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--link-color, #3476b8);
    font: inherit;
    cursor: pointer;
    text-decoration: none;
  }
  .utility-select-types:hover, .utility-select-types:focus-visible {
    color: var(--link-color, #3476b8);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .utility-select-types:focus-visible { outline: 2px solid var(--link-color, #3476b8); outline-offset: 3px; border-radius: 2px; }
  .utility-types { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
`;
export const LabelTable = styled.table.attrs({
  className: "freeform-ui-table",
})`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid ${colors.hairline};
  border-radius: 6px;
  overflow: hidden;
  table-layout: fixed;

  th, td { padding: 12px; text-align: left; overflow-wrap: anywhere; vertical-align: top; }
  th { background: var(--gray-050, #f7f9fc); font-weight: 600; }
  td { border-top: 1px solid ${colors.hairline}; }
  th:first-child, td:first-child { width: 40px; }
  small { display: block; margin-top: 6px; color: light-dark(${colors.gray400}, ${colors.muted}); font-size: 11px; font-weight: 400; }
  tr[data-selected="false"] td:not(:first-child) { opacity: .55; }
  .utility-label { white-space: pre-wrap; }
  mark { padding: 1px 2px; border-radius: 2px; color: inherit; font-weight: 600; box-decoration-break: clone; }
  .utility-label-current mark { background: light-dark(#fce8e6, color-mix(in srgb, var(--error-color) 22%, var(--pane-bg))); color: light-dark(var(--fg-error, var(--error-color, #a32920)), var(--gray-800)); }
  .utility-label-updated mark { background: light-dark(#e1f3ec, color-mix(in srgb, var(--enabled-color) 28%, var(--pane-bg))); color: light-dark(var(--fg-success, var(--success-color, #176248)), var(--gray-800)); }
`;
export const PreviewHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 24px 0 12px;
  h2 { margin: 0; font-size: 16px; }
  span { color: ${colors.gray500}; font-size: 13px; }
`;
export const EmptyPreview = styled.p`
  padding: 24px;
  border: 1px dashed light-dark(${colors.gray250}, var(--hairline-color));
  border-radius: 6px;
  text-align: center;
  color: ${colors.gray500};
`;
