import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

import {
  PreviewEditor,
  PreviewEditorContainer,
} from '../../preview/previewable-component.styles';

export const TableEditorWrapper = styled(PreviewEditor)``;

export const TableContainer = styled(PreviewEditorContainer)`
  background-color: white;
`;

export const TabularOptions = styled.table`
  width: 100%;

  thead {
    background-color: ${colors.gray050};
    border: 1px solid red;
    border-radius: 5px 5px 0 0;

    th {
      padding: 6px;
      padding-inline: 10px !important;
      margin: 0;

      background-color: ${colors.gray050};
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
    $tiny ? '32px' : $width ? `${$width}px` : 'auto'};

  padding: ${({ $tiny }) => ($tiny ? '6px 9px !important' : '0 !important')};

  border: 1px solid rgba(0, 0, 0, 0.1);

  label {
    display: none;
  }
`;

export const Input = styled.input`
  width: 100%;
  height: 34px;

  padding: 6px 9px;

  background: ${colors.white};

  &:focus {
    box-shadow: var(--inner-focus-ring);
  }

  &::placeholder {
    color: ${colors.gray200};
  }

  &:disabled {
    background: #00000004;
    color: ${colors.gray300};
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
