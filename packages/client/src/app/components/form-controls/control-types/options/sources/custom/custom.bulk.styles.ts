import {
  ControlWrapper,
  FormField,
  Instructions,
  LabelGroup,
} from "@components/form-controls/control.styles";
import { dropdownControl } from "@ff-client/styles/craft6";
import styled from "styled-components";

export const BulkEditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--c-spacing-lg, 24px);
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--c-spacing-lg, 24px);

  ${ControlWrapper} {
    gap: var(--c-spacing-sm, 8px);
    min-width: 0;
  }

  > ${ControlWrapper} {
    flex: 1;
    min-height: 280px;
  }

  ${LabelGroup} {
    flex: 0 0 auto;
  }

  ${FormField} {
    flex: 1;
    height: auto;
    min-height: 0;
  }

  ${Instructions} {
    font-style: normal;
    line-height: 1.5;
    margin: var(--c-spacing-xs, 4px) 0 0;
  }

  textarea {
    flex: 1;
    min-height: 180px;
    resize: none;
  }
`;
export const BulkSettings = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: var(--c-spacing-lg, 24px);
  align-items: end;
`;
export const BulkSelect = styled.select`
  ${dropdownControl}
  width: 100%;
  min-width: 0;

`;
