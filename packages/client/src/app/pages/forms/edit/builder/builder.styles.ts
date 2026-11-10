import { textControl } from "@ff-client/styles/craft6";
import { borderRadius } from "@ff-client/styles/variables";
import styled from "styled-components";

export const BuilderWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  height: 100%;

  input.text:not([slot='input']),
  textarea.text:not([slot='input']) {
    ${textControl}
  }
`;

export const BuilderContent = styled.div`
  flex-grow: 1;
  overflow: hidden;

  box-shadow: var(--pane-shadow);
  border-radius: ${borderRadius.lg};
`;
