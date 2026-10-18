import { TokenPillStyles } from "@components/elements/token-input/token-input.styles";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const PreviewTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacings.md};

  mark {
    padding: 0 ${spacings.xs};
    border-radius: ${borderRadius.lg};
    background: ${colors.gray200};
  }
`;

export const CalculationBoxWrapper = styled.div`
  ${TokenPillStyles}
  .tagify__input {
    min-height: 80px;
    line-height: 2.2;
  }

  .sr-only-value {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

export const TagMenu = styled.ul`
  min-width: 25%;
`;
