import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const PreviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  background-color: ${colors.white};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  overflow: auto;
`;

export const PreviewContainer = styled.div`
  border: 1px solid ${colors.gray200};
  border-radius: 5px;
  box-shadow: 0 1px 12px #31315d26;
`;

export const HeaderRow = styled.div`
  height: 16px;

  background: ${colors.gray050};
  border-radius: 5px 5px 0 0;

  font-size: 1px;
  line-height: 1px;
`;

export const Row = styled.div`
  display: flex;
  gap: 5px;

  padding: 4px 0;

  border-bottom: 1px solid ${colors.hairline};

  &:last-child {
    border-bottom: none;
    border-radius: 0 0 5px 5px;
  }
`;

export const Label = styled.label`
  display: block;

  flex-basis: 120px;

  font-size: 13px;
  font-weight: 700;
  text-align: right;
  color: ${colors.gray250};
`;

export const Value = styled.div`
  flex: 1;
  padding: 0 5px 0 15px;

  font-size: 13px;
  color: ${colors.gray900};
`;

export const Body = styled.div`
  width: 100%;
  padding: ${spacings.md} ${spacings.xl};
`;

export const Input = styled.input`
  padding: 0 ${spacings.xs};

  border: 1px solid rgba(96, 125, 159, 0.25);
  border-radius: 3px;

  font-size: 12px;
`;
