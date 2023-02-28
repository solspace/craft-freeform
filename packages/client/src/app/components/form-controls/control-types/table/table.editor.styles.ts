import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

import {
  PreviewEditor,
  PreviewEditorContainer,
} from '../../preview/previewable-component.styles';

export const TableEditorWrapper = styled(PreviewEditor)``;

export const TableContainer = styled(PreviewEditorContainer)``;

export const TabularOptions = styled.table`
  width: 100%;
`;

export const Row = styled.tr``;

type CellProps = {
  width?: number;
  tiny?: boolean;
};
export const Cell = styled.td<CellProps>`
  width: ${({ tiny, width }) =>
    tiny ? '20px' : width ? `${width}px` : 'auto'};

  padding: 0 !important;

  border: 1px solid rgba(0, 0, 0, 0.1);
`;

// TODO: move to options styles
export const CheckboxWrapper = styled.div`
  margin: 0 0 10px 0;
`;

export const Input = styled.input`
  width: 100%;
  padding: 6px 9px;

  &:focus {
    box-shadow: var(--inner-focus-ring);
  }

  &::placeholder {
    color: ${colors.gray200};
  }
`;

export const InputPreview = styled(Input)`
  cursor: pointer;
  min-width: 100%;

  &.with-border {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
`;

export const Select = styled.select`
  width: 100%;
  height: 100%;

  padding: 6px 9px;

  &:focus {
    box-shadow: var(--inner-focus-ring);
  }
`;

export const Button = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  margin: 0 5px;

  &:disabled {
    cursor: not-allowed;
    color: lightgray;
  }
`;

const Icon = styled.div`
  border: 0 !important;

  &::after {
    font-weight: 800;
  }
`;

export const DragIcon = styled(Icon)`
  &::after {
    content: '\\2723';
  }
`;

export const DeleteIcon = styled(Icon)`
  &::after {
    content: '\\2715';
  }
`;
