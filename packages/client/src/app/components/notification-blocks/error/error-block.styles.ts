import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacings.sm};
  padding: 12px ${spacings.md};
  min-width: 0;

  color: ${colors.red800};
  background-color: #fff5f5;
  border: 1px solid #f2c6ca;
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
