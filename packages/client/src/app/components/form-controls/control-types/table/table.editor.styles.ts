import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from "@ff-client/styles/variables";
import styled from "styled-components";

import {
  PreviewEditor,
  PreviewEditorContainer,
} from "../../preview/previewable-component.styles";

import { TableColumnTabsWrapper } from "./editor/table.editor.styles";

export const TableEditorWrapper = styled(PreviewEditor)`
  gap: 0;
  padding: 0;
`;

export const TableContainer = styled(PreviewEditorContainer)`
  border-radius: ${borderRadius.lg};
  background-color: light-dark(white, var(--pane-bg, #fff));
`;

export const ColumnTabsWrapper = styled(TableColumnTabsWrapper)`
  padding: 0 ${spacings.lg};

  background: ${colors.gray050};
  box-shadow: ${shadows.bottom};
`;

export const ColumnEditor = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};

  padding: ${spacings.lg};
`;

export const TabularOptions = styled.table.attrs({
  className: "freeform-ui-table",
})`
  width: 100%;

  thead {
    background-color: light-dark(${colors.gray050}, var(--ui-control-bg-color));
    border: 1px solid ${colors.border};
    border-radius: 5px 5px 0 0;

    th {
      padding: 6px;
      padding-inline: 10px !important;
      margin: 0;

      background-color: light-dark(${colors.gray050}, var(--ui-control-bg-color));
      border: 1px solid ${colors.hairline};
    }
  }
`;

export const Row = styled.tr``;

type CellProps = {
  $width?: number;
  $tiny?: boolean;
};
export const Cell = styled.td<CellProps>`
  width: ${({ $tiny, $width }) =>
    $tiny ? "32px" : $width ? `${$width}px` : "auto"};

  padding: ${({ $tiny }) => ($tiny ? "6px 9px !important" : "0 !important")};

  border: 1px solid light-dark(rgba(0, 0, 0, 0.1), ${colors.border});
  background: light-dark(transparent, ${colors.surface});

  label {
    display: none;
  }
`;

export const Input = styled.input`
  width: 100%;
  height: 34px;

  padding: 6px 9px;

  background: light-dark(${colors.white}, ${colors.surface});

  &:focus {
    box-shadow: var(--inner-focus-ring);
  }

  &::placeholder {
    color: ${colors.gray200};
  }

  &:disabled {
    background: #00000004;
    color: light-dark(${colors.gray300}, ${colors.muted});
  }
`;

export const Select = styled.select`
  height: 34px;

  padding: 6px 9px;

  &:focus {
    box-shadow: var(--inner-focus-ring);
  }
`;

export const Button = styled.button`
  padding: 1px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  &.handle {
    cursor: move;
  }

  &:disabled {
    cursor: not-allowed;
    color: lightgray;
  }

  > svg {
    fill: currentColor;
  }
`;

export const CenterPoint = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
