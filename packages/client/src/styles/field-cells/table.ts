import { css } from "styled-components";

export const TableCell = css`
  && .table-cell-preview-wrapper {
    overflow-x: auto;
  }

  && .table-cell-preview {
    width: 100%;
    min-width: calc(var(--table-preview-columns, 1) * 100px);
    table-layout: fixed;
    margin: 0;
    border-spacing: 0;
    border-collapse: separate;
    border: 1px solid var(--c-color-neutral-border-quiet, #d5dbe3);
    border-radius: var(--c-radius-sm, 3px);
    background: var(--c-surface-default, white);

    th,
    td {
      width: auto;
      padding: 8px 10px !important;
      border: 0 !important;
      background: transparent !important;
      color: var(--c-text-default, #2d3748) !important;
      vertical-align: middle;
      white-space: normal;
    }

    thead th {
      font-size: var(--c-text-sm, 0.875em);
      font-weight: 600 !important;
      text-align: start;
      overflow-wrap: anywhere;
      border-radius: 0 !important;
      border-bottom: 2px solid var(--c-color-neutral-border-quiet, #d5dbe3) !important;
    }

    tbody tr + tr td {
      border-top: 1px solid var(--c-color-neutral-border-quiet, #d5dbe3) !important;
    }

    input:not([type='checkbox']):not([type='radio']),
    textarea,
    select {
      width: 100%;
      min-width: 0;
      max-width: 100%;
      min-height: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 0;
      background: transparent !important;
      color: inherit;
      box-shadow: none !important;
      font: inherit;
      line-height: inherit;
      pointer-events: none;
    }

    textarea {
      field-sizing: content;
      min-height: 1.5em;
      resize: none;
    }

    .select {
      display: block;
      width: 100%;
      border: 0;
      background: transparent;
      box-shadow: none;

      select {
        padding-inline-end: 1.5em !important;
      }
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      justify-content: center;

      label {
        position: relative !important;
      }
    }

    input[type='checkbox'],
    input[type='radio'] {
      pointer-events: none;
    }
  }
`;
