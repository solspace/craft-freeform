import {
  ControlWrapper,
  FormField,
  Instructions,
  LabelGroup,
} from "@components/form-controls/control.styles";
import styled from "styled-components";

export const BulkEditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--l, 18px);
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--l, 18px);

  ${ControlWrapper} {
    gap: var(--s, 8px);
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
    margin: var(--xs, 4px) 0 0;
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
  gap: var(--xl, 24px);
  align-items: end;
`;
export const BulkSelect = styled.div.attrs({ className: "select fullwidth" })`
  width: 100%;
  min-width: 0;

  select {
    width: 100%;
  }
`;
