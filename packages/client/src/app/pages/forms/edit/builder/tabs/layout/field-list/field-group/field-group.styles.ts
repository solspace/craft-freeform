import { editorButton, sectionHeading } from "@ff-client/styles/craft6";
import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const FieldGroupWrapper = styled.div`
  margin-bottom: ${spacings.xl};

  &.disabled {
    opacity: 0.5;
    user-select: none;
    pointer-events: none;
  }
`;

export const GroupTitle = styled.h2.attrs({
  className: "freeform-field-group-title",
})`
  ${sectionHeading}
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacings.sm};
  min-height: var(--c-size-control-md);
  font-size: var(--c-text-base);
  margin: 0;
  padding: 0;
  margin-bottom: ${spacings.sm};

  button {
    ${editorButton}
    flex: none;
    width: var(--c-size-control-md);
    padding: 0;
    border-color: transparent;
    background: transparent;
  }
`;

export const List = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;

  margin: 0;
  padding: 0;
`;
