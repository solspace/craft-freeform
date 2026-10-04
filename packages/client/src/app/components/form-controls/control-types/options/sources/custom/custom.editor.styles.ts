import {
  Button,
  Cell,
  Input,
  TableContainer,
  TabularOptions,
} from "@components/form-controls/control-types/table/table.editor.styles";
import { PreviewEditor } from "@components/form-controls/preview/previewable-component.styles";
import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const OptionsEditor = styled(PreviewEditor)`
  width: min(800px, calc(100vw - 32px));
  min-width: 0;
  max-height: calc(100vh - 32px);
  overflow-y: auto;

  background: var(--c-surface-default, white);
  border: 1px solid var(--c-color-neutral-border-normal, #cbd2d9);
  border-radius: var(--c-radius-md, 5px);
`;

export const ChoiceWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--c-spacing-md, 16px);

  > :first-child {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
  }
`;

export const BulkWrapper = styled.div`
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  gap: var(--c-spacing-xs, 4px);
`;

export const BulkButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacings.sm};

  padding: 0;
  border: 0;
  background: transparent;
  color: var(--c-text-quiet);

  &:focus-visible {
    box-shadow: var(--focus-ring);
  }

  span {
    white-space: nowrap;
  }

  &:hover {
    span {
      text-decoration: underline;
    }
  }
`;

export const CopyButtonWrapper = styled.div`
  position: relative;
`;

export const TableWithButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--c-spacing-sm, 8px);
  min-width: 0;

  ${TableContainer} {
    border: 1px solid var(--c-color-neutral-border-normal, #cbd2d9);
    border-radius: var(--c-radius-sm, 3px);
    overflow-x: auto;
    background: var(--c-surface-default, white);
  }

  ${TabularOptions} {
    border-collapse: separate;
    border-spacing: 0;

    thead {
      background: transparent;
      border: 0;

      th {
        padding: 8px 10px;
        background: transparent;
        border: 0;
        border-bottom: 1px solid var(--c-color-neutral-border-normal, #cbd2d9);
        color: var(--c-text-default);
        font-weight: 600;
        text-align: start;
        white-space: nowrap;
      }
    }

    tbody tr + tr ${Cell} {
      border-top: 1px solid var(--c-color-neutral-border-quiet, #e3e5e8);
    }
  }

  ${Cell} {
    border: 0;
    vertical-align: middle;
  }

  ${Input} {
    min-width: 80px;
    height: 40px;
    padding: 8px 10px;
    background: transparent;
    border: 0;
    border-radius: 0;
    color: var(--c-text-default);

    &:focus {
      outline: none;
      box-shadow: var(--inner-focus-ring);
    }
  }

  ${Button} {
    width: 20px;
    height: 24px;
    border: 0;
    background: transparent;
    color: var(--c-text-quiet);
    border-radius: var(--c-radius-sm, 3px);

    &.handle svg {
      height: 10px;
    }

    &.delete {
      color: var(--c-color-danger-on-quiet, #a12a2a);
    }

    &:hover {
      background: var(--c-color-neutral-fill-normal, #edf0f3);
    }

    &:focus-visible {
      box-shadow: var(--focus-ring);
    }
  }
`;

export const AddOptionButton = styled.button`
  align-self: flex-start;
`;
