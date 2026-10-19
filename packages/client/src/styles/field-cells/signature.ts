import { css } from "styled-components";
import { colors } from "../variables";

export const SignatureCell = css`
  .ff-signature-preview {
    min-width: 0;
    width: 100%;
  }

  .ff-signature-preview__pad {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
    border: 1px solid var(--ff-signature-preview-border, ${colors.inputBorder});
    border-radius: 3px;

    svg {
      position: absolute;
      inset: 0;
      display: block;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      padding: 8px;
    }
  }

  .ff-signature-preview__clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-height: 34px;
    margin-top: 8px;
    padding: 6px 12px;
    border: 1px solid ${colors.inputBorder};
    border-radius: 3px;
    background: ${colors.white};
    color: ${colors.gray500};
    font: inherit;
    line-height: 20px;
    pointer-events: none;
  }
`;
