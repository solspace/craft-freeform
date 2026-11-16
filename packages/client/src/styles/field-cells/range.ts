import { css } from "styled-components";
import { colors } from "../variables";

export const RangeCell = css`
  && input.ff-range-preview[type='range'] {
    appearance: none;
    padding: 0;
    border: 0;
    background: transparent;

    &::-webkit-slider-runnable-track {
      box-sizing: border-box;
      height: 8px;
      border: 1px solid ${colors.inputBorder};
      border-radius: 4px;
      background: light-dark(#fff, var(--input-bg));
    }
    &::-moz-range-track {
      box-sizing: border-box;
      height: 8px;
      border: 1px solid ${colors.inputBorder};
      border-radius: 4px;
      background: light-dark(#fff, var(--input-bg));
    }
    &::-webkit-slider-thumb {
      appearance: none;
      box-sizing: border-box;
      width: 16px;
      height: 16px;
      margin-top: -5px;
      border: 0;
      border-radius: 50%;
      background: var(--link-color, #2585c6);
    }
    &::-moz-range-thumb {
      box-sizing: border-box;
      width: 16px;
      height: 16px;
      border: 0;
      border-radius: 50%;
      background: var(--link-color, #2585c6);
    }
  }
`;
