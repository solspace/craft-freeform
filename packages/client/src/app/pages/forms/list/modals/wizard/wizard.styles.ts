import { ModalContainer } from "@components/modals/modal.styles";
import { Wrapper as InfoBanner } from "@components/notification-blocks/info/info-block.styles";
import styled from "styled-components";

export const WizardContainer = styled(ModalContainer)`
  display: flex; flex-direction: column; width: calc(100% - 48px); max-width: 1100px; max-height: calc(100dvh - 48px); min-height: min(740px, calc(100dvh - 48px)); overflow: hidden; margin: 24px;
  animation: wizard-open .5s .16s cubic-bezier(.22,.7,.22,1) backwards;
  @keyframes wizard-open { from { opacity: 0; clip-path: inset(8px 4px 14px round 10px); } to { opacity: 1; clip-path: inset(0 round 10px); } }
  &[data-review=true] { height: min(920px, calc(100dvh - 48px)); background: #f1f5fa; }
  &[data-complete=true] { max-width: 520px; min-height: 0; height: auto; }
  &[data-handoff=revealing] { opacity: 0; transform: scale(.96); transition: opacity .55s ease, transform .55s ease; pointer-events: none; }
  &[data-review=true] > footer .btn.submit:not(:disabled) { animation: wizard-create-glow 3s ease-in-out infinite; }
  @keyframes wizard-create-glow { 0%, 100% { box-shadow: 0 0 0 0 #d81f3230; } 50% { box-shadow: 0 0 0 5px #d81f3214, 0 0 18px #d81f3240; } }
  color: var(--gray-700, #3f4d5a);
  @media (min-width: 1051px) {
    &[data-builder-background=true]:not([data-review=true]):not([data-complete=true]) {
      max-width: 760px; margin: 24px;
      min-height: min(660px, calc(100dvh - 160px)); max-height: calc(100dvh - 140px);
      > div:has(> .wizard-editor) { display: block; overflow-y: auto; }
      .wizard-editor { overflow: visible; }
      .wizard-preview-toggle { display: none; }
      > div > aside { display: none; }
      > footer { flex-wrap: wrap; }
    }
  }
  > header { padding: 22px 28px 18px; background: var(--gray-100, #e9eff6); border-bottom: 1px solid #dce5ef; }
  ${InfoBanner} { padding: 8px 12px; gap: 8px; font-size: 12px; }
  ${InfoBanner} > svg { width: 16px; height: 16px; }
  .wizard-heading button { cursor: pointer; }
  .wizard-heading[data-movable=true] { cursor: grab; touch-action: none; user-select: none; }
  .wizard-heading[data-moving=true] { cursor: grabbing; }
  .wizard-heading { display: flex; align-items: center; gap: 12px; }
  .wizard-heading-icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: #fff; border: 1px solid #ccdced; color: #4775a6; font-size: 22px; }
  h1 { margin: 0; font-size: 20px; line-height: 1.4; }
  .wizard-view-switch { margin-left: auto; padding: 6px 0; border: 0; background: transparent; color: var(--link-color, #0b69a3); font: inherit; font-size: 12px; cursor: pointer; }
  .wizard-view-switch:hover { text-decoration: underline; }
  .wizard-view-switch + .wizard-close { margin-left: 0; }
  @media (max-width: 1050px) { .wizard-view-switch { display: none; } }
  .wizard-close { margin-left: auto; border: 0; background: transparent; padding: 8px; color: #617488; font-size: 23px; cursor: pointer; }
  .wizard-steps { display: flex; list-style: none; margin: 20px 0 0; padding: 0; }
  .wizard-steps li { flex: 1; min-width: 0; position: relative; }
  .wizard-steps li + li::before { content: ""; position: absolute; inset-inline-start: calc(-50% + 20px); inset-inline-end: calc(50% + 20px); top: 20px; height: 2px; background: #cbd7e4; transition: background .2s ease; }
  .wizard-steps li[data-reached=true]::before { background: #7da9ce; }
  .wizard-steps button { position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; min-height: 66px; padding: 6px 4px; font: inherit; font-size: 12px; line-height: 1.35; background: transparent; border: 0; border-radius: 5px; cursor: pointer; text-align: center; color: #718196; }
  .wizard-steps button:disabled { cursor: default; }
  .wizard-steps button:not(:disabled):hover .wizard-step-label { color: var(--link-color, #0b69a3); }
  .wizard-steps [aria-current=step] { color: #285f94; font-weight: 600; }
  .wizard-step-number { display: grid; place-items: center; box-sizing: border-box; width: 28px; height: 28px; flex: none; border: 1px solid #b9cbdc; border-radius: 50%; background: #f9fbfe; color: #72869a; font-size: 12px; font-weight: 500; transition: background .2s ease, border-color .2s ease, box-shadow .2s ease; }
  [aria-current=step] .wizard-step-number { background: #3478b9; color: #fff; border-color: #3478b9; box-shadow: 0 0 0 4px #3478b918; font-weight: 600; }
  .wizard-step-number.wizard-step-done { color: #287e58; border-color: #b0cebd; background: #e7f2eb; font-size: 15px; }
  .wizard-step-label { max-width: 100%; overflow-wrap: anywhere; }
  .wizard-progress { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .wizard-footer-link { background: transparent; box-shadow: none; color: var(--link-color, #0b69a3); padding-inline: 3px; font-size: 12px; }
  > footer { display: flex; align-items: center; gap: 10px; padding: 15px 28px; border-top: 1px solid #dce5ef; background: #f3f7fc; }
  .wizard-footer-note { margin-left: auto; color: #6a7c90; font-size: 12px; }
  .wizard-saving-spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid #ffffff70; border-top-color: #fff; border-radius: 50%; margin-right: 8px; vertical-align: -2px; animation: wizard-spin .8s linear infinite; }
  .wizard-opening-spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid #cbd8e5; border-top-color: #3478b9; border-radius: 50%; margin-right: 8px; vertical-align: -2px; animation: wizard-spin .8s linear infinite; }
  @keyframes wizard-spin { to { transform: rotate(360deg); } }
  button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, summary:focus-visible { outline: 2px solid #5298da; outline-offset: 2px; }
  .wizard-error { padding: 12px 16px; border: 1px solid #f1c2c8; border-left: 4px solid #cf1124; border-radius: 5px; background: #fff6f7; color: #ae1724; margin: 0 0 18px; }
  > .wizard-error { margin: 16px 28px 0; flex: none; padding: 14px 16px; }
  > .wizard-error p { margin: 0 0 12px; }
  .wizard-confirm-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  @media (max-width: 750px) { > .wizard-error { margin: 12px 16px 0; } }
  .wizard-complete { margin: auto; padding: 40px; max-width: 650px; text-align: center; animation: wizard-complete-in .3s .18s ease both; }
  @keyframes wizard-complete-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .wizard-complete-mark { display: grid; place-items: center; width: 64px; height: 64px; margin: 0 auto 22px; border-radius: 50%; background: #e4f4eb; color: #2f855a; font-size: 32px; }
  .wizard-complete-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 24px 0; }
  .wizard-embed { padding: 14px; text-align: left; background: #f3f7fc; border: 1px solid #dae5ef; border-radius: 6px; }
  .wizard-embed code { display: block; overflow-wrap: anywhere; white-space: pre-wrap; margin-top: 8px; }
  @keyframes wizard-in { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
  @media (max-width: 750px) { width: calc(100% - 20px); max-height: calc(100dvh - 20px); margin: 10px; > header { padding: 16px; } > footer { padding: 12px 16px; flex-wrap: wrap; } .wizard-steps { margin-top: 16px; } .wizard-steps button { min-height: 40px; padding-inline: 0; } .wizard-step-label { display: none; } }
  @media (prefers-reduced-motion: reduce) { animation: none !important; transition: none !important; *, *::before, *::after { animation: none !important; transition: none !important; } }
`;

export const WizardBody = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, .85fr); min-height: 0; flex: 1; overflow: hidden;
  .wizard-editor { padding: 26px 28px; overflow-y: auto; min-width: 0; }
  .wizard-page { min-width: 0; padding: 0; margin: 0; border: 0; animation: wizard-in .25s ease both; }
  h2 { font-size: 20px; margin: 0 0 7px; }
  .wizard-intro { margin: 0 0 22px; color: #67798b; font-size: 13px; line-height: 1.6; }
  .wizard-banner-intro { margin-bottom: 10px; line-height: 1.5; }
  .wizard-fields-info, .wizard-step-info { margin-bottom: 12px; }
  .wizard-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; font-size: 13px; }
  .wizard-field > span { font-weight: 600; }
  .wizard-field small, .wizard-hint { font-size: 12px; color: #6b7c8d; line-height: 1.5; }
  .wizard-advanced { border-top: 1px solid #dce5ef; margin-top: 4px; }
  .wizard-advanced > summary { padding: 12px 0; color: var(--link-color, #2563eb); font-size: 13px; font-weight: 600; cursor: pointer; }
  .wizard-advanced-content { padding: 6px 0 0; }
  .wizard-details-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; }
  .wizard-details-row .wizard-field { min-width: 0; }
  .wizard-status-picker { border-radius: 5px; }
  .wizard-status-picker:focus-visible { outline: 2px solid #5298da; outline-offset: 2px; }
  .wizard-status-picker[aria-invalid=true] > div { outline: 1px solid #cf1124; border-radius: 5px; }
  .wizard-advanced .wizard-sites { margin-bottom: 0; }
  .wizard-color-control { display: flex; gap: 6px; }
  .wizard-advanced input:disabled, .wizard-advanced textarea:disabled, .wizard-advanced select:disabled { opacity: .6; cursor: not-allowed; }
  @media (max-width: 600px) { .wizard-details-row { grid-template-columns: 1fr; gap: 0; } }
  input:not([type=checkbox]):not([type=radio]), select, textarea { box-sizing: border-box; width: 100%; font: inherit; font-size: 13px; color: #3f4d5a; border: 1px solid #c8d4e1; border-radius: 5px; background: #fbfcfe; padding: 9px 10px; }
  .wizard-color-control input[type=color] { flex: none; width: 35px; min-width: 35px; height: 36px; padding: 3px; cursor: pointer; }
  .wizard-color-control input:not([type=color]) { min-width: 0; font-size: 12px; padding-inline: 7px; }
  textarea { resize: vertical; }
  .wizard-select { display: block; width: 100%; }
  .wizard-select select { appearance: none; padding-inline-end: 34px; background-color: #dfe5ec; border-color: transparent; }
  .wizard-select::after { right: 12px; inset-inline-end: 12px; }
  input:not([type=checkbox]):not([type=radio])[aria-invalid=true], select[aria-invalid=true], textarea[aria-invalid=true], .wizard-sites[aria-invalid=true], .wizard-field-item[data-invalid=true] { border: 1px solid #cf1124; box-shadow: 0 0 0 1px #cf112433; }
  .wizard-purpose-grid[aria-invalid=true], .wizard-field-list[data-invalid=true] { outline: 1px solid #cf1124; outline-offset: 4px; border-radius: 6px; }
  [aria-invalid=true]:focus-visible { outline-color: #cf1124; }
  .wizard-toggle { align-items: flex-start; }
  .wizard-toggle button { flex: none; margin-top: 1px; }
  .wizard-toggle-text { flex: 1; min-width: 0; line-height: 20px; }
  .wizard-toggle-instructions { margin: 3px 0 0; color: #718196; font-size: 12px; line-height: 1.5; }

  .wizard-sites { border: 1px solid #d8e2ed; border-radius: 6px; padding: 12px 16px; margin: 0 0 18px; }
  .wizard-sites legend { padding: 0 5px; font-size: 13px; font-weight: 600; }
  .wizard-sites .wizard-hint { margin: 0; }
  .wizard-sites .wizard-check { align-items: center; gap: 6px; margin: 4px 0; line-height: 20px; cursor: pointer; }
  .wizard-sites .wizard-check input { flex: none; margin: 0; }
  .wizard-sites-select-all + .wizard-check { margin-top: 8px; }
  .wizard-sites .wizard-check:last-child { margin-bottom: 0; }
  .wizard-sites-select-all { display: inline-block; padding: 0; margin: 10px 0 0; border: 0; background: none; color: var(--link-color, #0b69a3); font: inherit; font-size: 12px; cursor: pointer; }
  .wizard-sites-select-all:hover { text-decoration: underline; }

  .wizard-check { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; margin: 12px 0; }
  .wizard-check input { margin: 3px 0 0; }
  .wizard-build-progress { display: flex; align-items: center; gap: 12px; padding: 9px 12px; margin-bottom: 16px; background: #edf5fe; border-radius: 5px; color: #486a89; font-size: 12px; }
  .wizard-build-progress button { margin-left: auto; padding: 0; border: 0; background: none; color: var(--link-color, #0b69a3); font: inherit; cursor: pointer; }
  .wizard-purpose-grid { border: 0; padding: 0; margin: 0; min-width: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .wizard-purpose { display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 3px 12px; align-content: start; padding: 14px; border: 1px solid #d3deea; border-radius: 8px; background: #fff; text-align: left; cursor: pointer; color: #415366; transition: border-color .18s, transform .18s, box-shadow .18s; }
  .wizard-purpose:hover { transform: translateY(-2px); border-color: #8db0d3; box-shadow: 0 4px 12px #3c699514; }
  .wizard-purpose[aria-pressed=true] { border-color: #4e8bc5; background: #f0f6fd; box-shadow: 0 0 0 1px #4e8bc5; }
  .wizard-purpose strong { grid-column: 2; margin: 0; font-size: 14px; overflow-wrap: anywhere; }
  .wizard-purpose small { grid-column: 2; color: #718196; font-size: 11px; line-height: 1.4; }
  .wizard-purpose-icon { grid-row: 1 / 3; align-self: start; margin-top: 2px; font-size: 21px; color: #5c84af; }
  &[data-review=true] { grid-template-columns: 1fr; grid-template-rows: auto minmax(0, 1fr); }
  &[data-review=true] .wizard-editor { padding: 10px 28px; max-height: 240px; }
  &[data-review=true] .wizard-page { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 20px; }
  &[data-review=true] .wizard-error { width: 100%; }
  &[data-review=true] > aside { grid-row: 2; display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: auto auto auto minmax(0, 1fr); align-items: center; gap: 5px 18px; padding: 12px 28px; }
  &[data-review=true] > aside .wizard-preview-header { grid-row: 1; grid-column: 1 / -1; margin: 0; }
  &[data-review=true] > aside .wizard-preview-note { grid-row: 2; grid-column: 1 / -1; margin: 0 0 6px; }
  &[data-review=true] > aside .wizard-preview-guidance { grid-row: 3; grid-column: 1 / -1; margin: 0 0 6px; }
  &[data-review=true] > aside .wizard-preview-stage { grid-row: 4; grid-column: 1 / -1; align-self: stretch; }

  &[data-review=true] .wizard-intro { display: none; }
  &[data-review=true] h2 { font-size: 16px; margin-bottom: 6px; }
  &[data-review=true] .wizard-hint { margin: 0; }
  &[data-review=true] > aside { border: 0; }
  .wizard-field-list { display: flex; flex-direction: column; gap: 3px; margin: 0 0 18px; padding: 0; list-style: none; }
  .wizard-field-list[data-shared-rows=false] .wizard-field-row, .wizard-field-list[data-shared-rows=false] .wizard-new-row { padding-inline-start: 0; }
  .wizard-field-list[data-shared-rows=false] .wizard-new-row::before { inset-inline-start: 0; }
  .wizard-field-item { display: grid; grid-template-columns: 26px 22px minmax(0, 1fr) auto; align-items: center; min-height: 42px; border: 1px solid #d8e2ed; border-radius: 6px; background: #fff; }
  .wizard-field-row { position: relative; min-width: 0; padding-inline-start: 28px; box-sizing: border-box; }
  .wizard-row-handle { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; position: absolute; inset-inline-start: 0; top: 7px; width: 22px; height: 34px; padding: 3px; border: 0; border-radius: 4px; background: transparent; color: #6b8198; cursor: grab; touch-action: none; }
  .wizard-row-handle:hover { color: #3e6f9d; background: #cdddec; }
  .wizard-row-handle:active { cursor: grabbing; }
  .wizard-row-ghost { opacity: .35; }
  .wizard-row-chosen > .wizard-row-fields { border-color: #83add5; box-shadow: 0 4px 14px #294d7824; }
  .wizard-row-editor { margin-top: 8px; }
  .wizard-row-fields { box-sizing: border-box; display: flex; gap: 6px; min-height: 42px; padding: 6px; margin: 0; list-style: none; background: #edf2f7; border: 1px dashed #cbd8e5; border-radius: 6px; }
  .wizard-row-fields .wizard-field-item { flex: 1; min-width: 0; }
  .wizard-field-type-picker { position: relative; display: grid; place-items: center; width: 22px; height: 28px; color: #5a7d9e; border-radius: 3px; }
  .wizard-field-type-picker > span { display: flex; width: 16px; height: 16px; }
  .wizard-field-type-picker svg { width: 16px; height: 16px; }
  .wizard-field-type-picker select { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; padding: 0; }
  .wizard-field-type-picker:hover, .wizard-field-type-picker:focus-within { background: #e8eff6; outline: 1px solid #aac3db; }
  .wizard-field-title { display: flex; align-items: center; gap: 6px; min-width: 0; padding: 9px 4px; text-align: left; border: 0; background: transparent; cursor: text; color: inherit; font: inherit; font-size: 12px; }
  .wizard-field-title strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
  .wizard-field-pencil { flex: none; color: #8a9cad; opacity: 0; }
  .wizard-field-title:hover .wizard-field-pencil, .wizard-field-title:focus-visible .wizard-field-pencil { opacity: 1; }
  input.wizard-field-label-input { min-width: 0; padding: 5px 4px; height: 29px; font-size: 12px; }
  .wizard-field-tools { display: flex; align-items: center; gap: 1px; padding-right: 3px; }
  .wizard-field-small-action { display: grid; place-items: center; width: 20px; height: 26px; padding: 0; border: 0; border-radius: 3px; background: transparent; color: #8a9cad; font: inherit; font-size: 17px; cursor: pointer; }
  .wizard-field-small-action:hover { background: #e8eff6; color: #426d95; }
  .wizard-field-required { font-weight: 700; }
  .wizard-field-required[aria-pressed=true] { color: #c8273c; }
  .wizard-field-remove:hover { background: #fff0f2; color: #b51d32; }
  .wizard-field-item[data-editing=true] { border-color: #4784bf; box-shadow: 0 0 0 1px #4784bf; }
  .wizard-row-editor { background: #fff; border: 1px solid #ccd9e7; border-radius: 6px; padding: 14px 4px 0; }
  .wizard-row-gap { position: relative; height: 10px; flex: none; margin: -4px 0; }
  .wizard-new-row { box-sizing: border-box; position: absolute; inset: 0; height: 10px; margin: 0; padding: 0; padding-inline-start: 28px; min-height: 10px; list-style: none; }
  .wizard-new-row::before { content: ""; position: absolute; inset-inline-start: 28px; inset-inline-end: 0; top: calc(50% - 1px); height: 2px; border-radius: 2px; background: #4e8bc5; opacity: 0; pointer-events: none; }
  .wizard-new-row[data-drop-active=true]::before { opacity: 1; }
  .wizard-new-row > .wizard-field-ghost { position: absolute; visibility: hidden; pointer-events: none; }
  .wizard-row-fields[data-drop-active=true] { border-color: #83add5; }
  .wizard-insert-row { position: absolute; z-index: 2; left: calc(50% + 14px); top: 50%; transform: translate(-50%, -50%); }
  .wizard-insert-field { display: grid; place-items: center; width: 22px; height: 22px; padding: 0; border: 1px solid #9bbadd; border-radius: 50%; background: #fff; color: #3478b9; font: inherit; font-size: 18px; line-height: 1; cursor: pointer; opacity: 0; transition: opacity .12s, background .12s; }
  .wizard-field-list[data-empty=true] .wizard-row-gap { height: 32px; margin: 0; }
  .wizard-field-list[data-empty=true] .wizard-insert-field { opacity: 1; }
  .wizard-insert-field > svg { display: block; width: 14px; height: 14px; }
  .wizard-row-gap:hover .wizard-insert-field, .wizard-insert-field:hover, .wizard-insert-field:focus-visible, .wizard-insert-field[aria-expanded=true] { opacity: 1; }
  .wizard-insert-field:hover, .wizard-insert-field[aria-expanded=true] { background: #e8f1fb; border-color: #3478b9; }
  .wizard-row-inserts { position: absolute; inset: 0 0 0 28px; pointer-events: none; }
  .wizard-inline-insert { position: absolute; z-index: 2; top: 50%; transform: translate(-50%, -50%); pointer-events: auto; }
  .wizard-inline-insert:first-child { left: -8px !important; }
  .wizard-inline-insert:last-child { left: calc(100% + 8px) !important; }
  .wizard-field-list[data-shared-rows=false] .wizard-row-inserts { inset-inline-start: 0; }
  .wizard-field-list:has(.wizard-field-chosen, .wizard-row-chosen) .wizard-insert-field { visibility: hidden; pointer-events: none; }
  @media (hover: none) { .wizard-insert-field { opacity: 1; } }

  .wizard-field-handle { display: grid; place-items: center; width: 24px; height: 28px; margin: 0; padding: 0; border: 0; border-radius: 4px; background: transparent; color: #8495a6; cursor: grab; touch-action: none; }
  .wizard-field-handle:hover { background: #e8eff6; color: #3e6f9d; }
  .wizard-field-handle:active { cursor: grabbing; }
  .wizard-field-ghost { opacity: .35; }
  .wizard-field-chosen { box-shadow: 0 4px 14px #294d7824; border-color: #83add5; }
  .wizard-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  .wizard-field-item summary { padding: 11px 12px 11px 4px; cursor: pointer; font-size: 13px; }
  .wizard-field-kind { color: #778b9f; font-size: 11px; margin-left: 8px; }
  .wizard-field-content { padding: 2px 12px 12px; }
  .wizard-field-actions { display: flex; align-items: center; gap: 6px; }
  .wizard-field-actions .wizard-remove { margin-left: auto; }
  .wizard-inline { display: flex; align-items: center; gap: 10px; }
  .wizard-inline > * { flex: 1; min-width: 0; }
  .wizard-email-template { border: 0; padding: 0; margin: 0 0 18px; min-width: 0; }
  .wizard-preview-toggle { display: none; }
  @media (max-width: 750px) { grid-template-columns: 1fr; .wizard-editor { padding: 20px 16px; } &[data-review=true] .wizard-editor, &[data-review=true] > aside { padding-inline: 16px; } .wizard-preview-toggle { display: block; margin-bottom: 16px; } &[data-preview=true] .wizard-editor .wizard-page { display: none; } }
`;

export const WizardPreviewPane = styled.aside`
  border-left: 1px solid #dce5ef; background: #f1f5fa; display: flex; flex-direction: column; min-height: 0; overflow: hidden; padding: 16px;
  .wizard-preview-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
  h3 { margin: 0; font-size: 18px; color: #586e86; }
  .wizard-preview-controls { display: flex; align-items: center; gap: 8px; margin-inline-start: auto; }
  .wizard-preview-tabs { display: flex; gap: 4px; }
  .wizard-preview-tabs button { border: 1px solid #ccd9e7; border-radius: 4px; font: inherit; font-size: 10px; padding: 5px 7px; cursor: pointer; background: #fff; color: #57708b; }
  .wizard-preview-tabs [aria-pressed=true] { background: #dceafa; color: #285e98; }
  .wizard-preview-note { margin: 0 0 15px; color: #73859a; font-size: 11px; line-height: 1.5; }
  .wizard-preview-guidance { flex: none; margin-bottom: 10px; }
  .wizard-preview-paper { padding: 24px 20px; border: 1px solid #d6e1ed; border-radius: 8px; background: #fff; box-shadow: 0 3px 16px #40658b09; }
  h4 { margin: 0 0 20px; font-size: 18px; }
  .wizard-preview-error { border: 1px solid #edb7be; border-radius: 5px; background: #fff1f2; color: #a6192e; padding: 12px; margin-bottom: 18px; overflow-wrap: anywhere; white-space: pre-wrap; }
  .wizard-preview-success { border: 1px solid #a9d5bc; border-radius: 5px; background: #e9f7ef; color: #276749; padding: 12px; margin-bottom: 18px; overflow-wrap: anywhere; white-space: pre-wrap; }
  .wizard-preview-row { display: flex; gap: 12px; }
  .wizard-preview-field[data-error=true] input, .wizard-preview-field[data-error=true] textarea, .wizard-preview-field[data-error=true] select { border-color: #cf1124; }
  .wizard-preview-field small.wizard-preview-field-error { color: #b42336; }
  .wizard-preview-field { flex: 1; min-width: 0; margin: 0 0 15px; animation: wizard-field-in .3s ease both; }
  .wizard-preview-field > label { display: block; font-size: 11px; font-weight: 500; margin-bottom: 5px; overflow-wrap: anywhere; }
  .wizard-preview-field input:not([type=radio]):not([type=checkbox]), .wizard-preview-field select, .wizard-preview-field textarea { width: 100%; min-width: 0; box-sizing: border-box; border: 1px solid #d7e0eb; border-radius: 4px; background: #fafcfe; color: #718096; padding: 7px; font-size: 11px; }
  .wizard-preview-field small { display: block; color: #738398; font-size: 10px; margin-top: 4px; }
  .wizard-preview-options { display: flex; flex-wrap: wrap; gap: 7px 12px; font-size: 10px; }
  .wizard-preview-options label { display: flex; align-items: center; gap: 4px; }
  .wizard-preview-stars { color: #edae39; letter-spacing: 3px; font-size: 23px; }
  .wizard-preview-submit { display: inline-block; padding: 8px 15px; border-radius: 4px; background: #3c75ad; color: #fff; font-size: 11px; }
  .wizard-preview-size { display: flex; align-items: center; gap: 10px; margin: 0; font-size: 11px; color: #586e86; }
  .wizard-preview-size > span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .wizard-preview-size .wizard-select { width: 112px; flex: none; }
  .wizard-preview-size select { appearance: none; font: inherit; color: #3f4d5a; padding: 6px 32px 6px 10px; border: 0; border-radius: 4px; background: #dfe5ec; }
  .wizard-preview-size .select::after { right: 10px; }
  .wizard-preview-stage { position: relative; flex: 1; min-height: 180px; overflow: hidden; }
  .wizard-preview-canvas { position: absolute; top: 0; transform-origin: top left; }
  .wizard-preview-canvas .wizard-preview-paper { box-sizing: border-box; height: 100%; overflow-y: auto; font-size: 16px; padding: 40px; }
  .wizard-preview-canvas .wizard-preview-field > label { font-size: 16px; }
  .wizard-preview-canvas .wizard-preview-field input, .wizard-preview-canvas .wizard-preview-field textarea, .wizard-preview-canvas .wizard-preview-field select { font-size: 16px; padding: 12px; }
  .wizard-preview-canvas h4 { font-size: 26px; }
  iframe { display: block; box-sizing: border-box; height: 100%; width: 100%; background: #fff; border: 1px solid #d6e1ed; border-radius: 6px; }
  .wizard-preview-status { font-size: 12px; padding: 20px; color: #6c7f94; }
  @keyframes wizard-field-in { from { opacity: .3; background: #e4f1ff; transform: translateY(4px); } to { opacity: 1; background: transparent; transform: translateY(0); } }
  @media (max-width: 750px) { display: none; [data-review=true] & { display: flex; } border: 0; padding: 16px; [data-preview=true] & { display: flex; } }
`;
