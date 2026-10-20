import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const InputRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${spacings.sm};
`;

export const ColorInput = styled.input`
  box-sizing: border-box;
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

  &[data-transparent='true'] {
    background-image: conic-gradient(#d8dee6 25%, #fff 0 50%, #d8dee6 0 75%, #fff 0);
    background-size: 8px 8px;

    &::-webkit-color-swatch { opacity: 0; }
    &::-moz-color-swatch { opacity: 0; }
  }
`;

export const HexInput = styled.input`
  box-sizing: border-box;
  width: 110px;
  min-width: 0;
  height: 32px;
  padding: 5px 10px;
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.sm};
  background: ${colors.white};
  color: ${colors.gray800};
  font: inherit;
  line-height: 20px;

  &:focus {
    outline: 0;
    border-color: ${colors.blue500};
    box-shadow: 0 0 0 1px ${colors.blue500};
  }
`;

export const TransparencyToggle = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  height: 32px;
  margin: 0;
  color: ${colors.gray800};
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;

  input {
    flex: 0 0 14px;
    width: 14px;
    height: 14px;
    margin: 0;
  }
`;
