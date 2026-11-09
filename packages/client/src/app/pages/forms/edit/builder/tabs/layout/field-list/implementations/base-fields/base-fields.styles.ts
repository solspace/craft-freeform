import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const GroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
  margin-bottom: ${spacings.md};

  svg {
    fill: ${({ color }) => (color === "#000000" || color === "#000" || color === "black" ? colors.text : color || colors.text)};
  }
`;

export const GroupName = styled.div`
  text-transform: uppercase;
  font-size: 10px;
`;
