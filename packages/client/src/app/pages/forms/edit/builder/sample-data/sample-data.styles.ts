import { TokenPillStyles } from "@components/elements/token-input/token-input.styles";
import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const SampleDefaultInputRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  > input, > textarea { flex: 1; min-width: 0; }
  .sample-picker-trigger {
    flex: none;
    width: 34px;
    height: 34px;
    padding: 8px;
    border: 1px solid ${colors.inputBorder};
    background: #fff;
  }
`;

export const SampleTokenWrapper = styled.div<{ $multiline: boolean }>`
  ${TokenPillStyles}
  flex: 1;
  min-width: 0;
  .tags-input { width: 100%; }
  .tagify {
    width: 100%;
    min-height: 34px;
  }
  .tagify__input {
    display: block;
    min-width: 0;
    min-height: ${({ $multiline }) => ($multiline ? "70px" : "24px")};
    margin: 3px 5px;
    padding: 0;
    line-height: 26px;
    font-size: 13px;
    color: ${colors.gray700};
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
  .tagify__tag { margin: 0 2px; vertical-align: baseline; font-size: 11px; line-height: 18px; }
  .tagify__tag:focus-visible { outline: 2px solid #3476b8; border-radius: 12px; }
  .tagify__tag__removeBtn { width: 14px; height: 14px; margin-inline-end: 3px; }
`;

export const ExpressionModeButton = styled.button`
  display: inline-flex;
  align-self: flex-start;
  width: fit-content;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 11px;
  color: var(--link-color, #3476b8);
  text-decoration: none;
  cursor: pointer;
  &:hover, &:focus-visible {
    color: var(--link-color, #3476b8);
    background: transparent;
    text-decoration: underline;
    text-decoration-color: currentColor;
    text-underline-offset: 2px;
  }
  &:focus-visible { outline: 2px solid var(--link-color, #3476b8); outline-offset: 3px; border-radius: 2px; }
`;

export const SamplePickerButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 4px 6px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: ${colors.gray500};
  font-size: 11px;
  white-space: nowrap;
  cursor: pointer;

  &:hover, &:focus-visible, &[aria-expanded='true'] {
    background: #e8f0fc;
    color: #3476b8;
  }
  &:focus-visible { outline: 2px solid #3476b8; outline-offset: 1px; }
  &:disabled { opacity: .5; cursor: default; }
`;

export const RefreshSamplesButton = styled(SamplePickerButton)`
  min-height: 30px;
  padding: 6px 10px;
  border: 1px solid ${colors.gray200};
  background: #f3f6fa;
  color: ${colors.gray600};
  font-weight: 500;

  svg { width: 14px; height: 14px; }
  &:hover:not(:disabled), &:focus-visible {
    border-color: #b8cee8;
    background: #e8f0fc;
    color: #3476b8;
  }
`;

export const OptionsHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 6px;
`;

export const OptionSampleToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 3px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: ${colors.gray500};
  cursor: pointer;

  &:hover, &:focus-visible { color: #3476b8; background: #e8f0fc; }
  &[aria-pressed='true'] {
    color: #fff;
    background: var(--bg-enabled, var(--enabled-color, #14b8a6));
    border-color: #008f83;
    border-color: oklch(from var(--bg-enabled, var(--enabled-color, #14b8a6)) calc(l - 0.1) c h);
  }
  &:focus-visible { outline: 1px solid transparent; box-shadow: var(--focus-ring); }
  &:disabled { cursor: default; opacity: .5; }
`;

export const OptionSampleArea = styled.div`
  position: relative;
  > .sample-data-action { position: absolute; top: -3px; right: 0; }
`;

export const PickerPanel = styled.div`
  width: 350px;
  max-width: calc(100vw - 24px);
  display: flex;
  flex-direction: column;
  max-height: min(500px, calc(100vh - 24px));
  overflow: hidden;
  border: 1px solid ${colors.gray200};
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 40px rgb(31 41 51 / 18%);
  color: ${colors.gray700};
  z-index: 9000;

  header { padding: 14px 14px 10px; }
  header > div { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  h3 { margin: 0; font-size: 14px; font-weight: 600; }
  input { width: 100%; }
  footer { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 12px 14px; border-top: 1px solid ${colors.gray100}; font-size: 11px; line-height: 1.5; color: ${colors.gray500}; }
`;

export const PickerResults = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 6px 8px;

  h4 { margin: 10px 8px 5px; color: ${colors.gray500}; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
  p { margin: 12px 8px; color: ${colors.gray500}; }
`;

export const GeneratorButton = styled.button`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 3px;
  text-align: start;
  border: 0;
  border-radius: 5px;
  padding: 8px;
  background: transparent;
  color: ${colors.gray700};
  cursor: pointer;
  font-size: 12px;

  &:hover, &:focus-visible, &[aria-pressed='true'] { background: #edf3fc; color: #2865a5; }
  &:focus-visible { outline: 2px solid #3476b8; outline-offset: -2px; }
  span:last-child { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: ${colors.gray500}; font-size: 11px; }
`;
