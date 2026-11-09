import { borderRadius } from "@ff-client/styles/variables";
import styled from "styled-components";

export const BuilderWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const BuilderContent = styled.div`
  flex-grow: 1;
  overflow: hidden;

  box-shadow: var(--pane-shadow);
  border-radius: ${borderRadius.lg};
`;
