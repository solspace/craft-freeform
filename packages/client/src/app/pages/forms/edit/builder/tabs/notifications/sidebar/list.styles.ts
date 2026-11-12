import { scrollBar } from "@ff-client/styles/mixins";
import styled from "styled-components";

export const ScrollableList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};
`;
