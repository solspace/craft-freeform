import { borderRadius, colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const IntegrationsLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--cp-header-height) - var(--c-spacing-lg));
`;

export const IntegrationsWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: stretch;
`;

export const IntegrationsEditorPanel = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background-color: ${colors.white};
  border-radius: 0 ${borderRadius.lg} ${borderRadius.lg} 0;
`;
