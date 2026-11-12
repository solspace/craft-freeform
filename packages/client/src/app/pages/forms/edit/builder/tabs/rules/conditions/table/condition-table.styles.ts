import { borderRadius, colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Table = styled.table.attrs({ className: "freeform-ui-table" })`
  width: 100%;
  margin: 0;
  border-spacing: 0;
  border-collapse: separate;

  td {
    padding: 8px;
    border-bottom: 1px solid ${colors.inputBorder};
    border-inline: 0;
    background: var(--c-surface-default);
    &:first-child { width: 25%; border-left: 1px solid ${colors.inputBorder}; }
    &:nth-child(2) { width: 20%; }
    &:last-child { width: 20px; border-inline-end: 1px solid ${colors.inputBorder}; }
  }
  tr:first-child td { border-top: 1px solid ${colors.inputBorder}; }
  tr:first-child td:first-child { border-start-start-radius: ${borderRadius.md}; }
  tr:first-child td:last-child { border-start-end-radius: ${borderRadius.md}; }
  tr:last-child td:first-child { border-end-start-radius: ${borderRadius.md}; }
  tr:last-child td:last-child { border-end-end-radius: ${borderRadius.md}; }
`;

export const Action = styled.button.attrs({ type: "button" })`
  margin: 0;
  padding: 0;
  border: none;
  color: ${colors.muted};
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
    stroke-width: 3px;
    fill: light-dark(#e5e7eb, currentColor);
  }

  &:hover { color: ${colors.error}; }
  &:focus-visible { outline: 2px solid ${colors.link}; outline-offset: 2px; }
`;
