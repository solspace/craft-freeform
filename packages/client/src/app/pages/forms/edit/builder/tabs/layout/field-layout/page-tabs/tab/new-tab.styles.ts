import { editorButton } from "@ff-client/styles/craft6";
import styled from "styled-components";

export const NewTabWrapper = styled.button`
  ${editorButton}
  flex: none;
  width: var(--c-size-control-md);
  height: var(--c-size-control-md);
  align-self: center;
  padding: 0;
  border-color: transparent;
  background: transparent;
  color: var(--c-text-quiet);

  svg {
    width: 18px;
    height: 18px;
  }
`;
