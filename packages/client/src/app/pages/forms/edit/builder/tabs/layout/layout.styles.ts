import { Sidebar } from "@components/layout/sidebar/sidebar";
import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Grid = styled.div`
  position: relative;
  display: flex;
  gap: 0;

  height: 100%;
  overflow: hidden;

  background: ${colors.surface};

  /* One divider for the palette and its overlaid property editor. */
  > ${Sidebar} {
    border-inline-end: 1px solid ${colors.border};
    box-shadow: none;
  }
`;
