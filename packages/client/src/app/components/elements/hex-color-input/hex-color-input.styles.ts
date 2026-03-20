import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacings.sm};
`;

export const ColorInput = styled.input`
  width: 40px;
  min-width: 40px;
  height: 32px;
  padding: 0;
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.sm};
  background: ${colors.white};
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 3px;
  }

  &::-webkit-color-swatch {
    border: 0;
    border-radius: ${borderRadius.sm};
  }

  &::-moz-color-swatch {
    border: 0;
    border-radius: ${borderRadius.sm};
  }
`;

export const HexInput = styled.input`
  width: 110px;
  min-width: 0;
  padding: 7px 10px;
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.sm};
  background: ${colors.white};
  color: ${colors.gray800};
  font: inherit;

  &:focus {
    outline: 0;
    border-color: ${colors.blue500};
    box-shadow: 0 0 0 1px ${colors.blue500};
  }
`;
