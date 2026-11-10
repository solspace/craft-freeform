import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacings.sm};
  padding: 12px ${spacings.md};
  min-width: 0;

  color: light-dark(${colors.red800}, ${colors.error});
  background-color: light-dark(#fff5f5, color-mix(in srgb, ${colors.error} 8%, ${colors.surface}));
  border: 1px solid light-dark(#f2c6ca, ${colors.error});
  border-inline-start: 3px solid ${colors.error};
  border-radius: ${borderRadius.lg};

  font-size: 13px;
  line-height: 1.5;

  > svg {
    flex: none;
    width: 18px;
    height: 18px;
    margin-top: 1px;
    fill: ${colors.error};
  }
`;

export const Message = styled.div`
  min-width: 0;
  overflow-wrap: anywhere;
`;
