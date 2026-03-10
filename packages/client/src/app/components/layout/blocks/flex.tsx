import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

type FlexProps = {
  $gap?: number | string;
  $justifyContent?: React.CSSProperties["justifyContent"];
  $alignItems?: React.CSSProperties["alignItems"];
};

export const FlexColumn = styled.div<FlexProps>`
  display: flex;
  flex-direction: column;
  justify-content: ${(props) => props.$justifyContent || "flex-start"};
  align-items: ${(props) => props.$alignItems || "stretch"};
  gap: ${(props) => props.$gap || spacings.sm};
`;

export const FlexRow = styled.div<FlexProps>`
  display: flex;
  justify-content: ${(props) => props.$justifyContent || "flex-start"};
  align-items: ${(props) => props.$alignItems || "stretch"};
  gap: ${(props) => props.$gap || spacings.sm};
`;
