import { borderRadius, colors, shadows } from "@ff-client/styles/variables";
import styled from "styled-components";

export const ABWrapper = styled.div`
  display: flex;
  margin-bottom: 50px;

  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.box};
  :root:not([data-dark-mode="dark"]) & {
    box-shadow: 0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%);
  };
`;

export const ABEditorPanel = styled.div`
  flex: 1;
  background-color: light-dark(${colors.white}, ${colors.surface});
  border-radius: 0 ${borderRadius.lg} ${borderRadius.lg} 0;
`;
