import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const ButtonGroupWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  padding: ${spacings.sm} ${spacings.md};

  border: 1px solid transparent;
  border-radius: ${borderRadius.md};

  cursor: pointer;

  transition:
    border-color 0.2s ease-out,
    background-color 0.2s ease-out;

  &.active {
    border: 1px dashed #5782ef;
  }

  &:hover {
    background: ${colors.mutedSurface};

    &:not(.active) {
      border: 1px solid var(--hairline-color, #cdd8e4);
    }
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacings.md};
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;

  img,
  svg {
    width: 24px;
    height: 24px;
  }

  svg {
    animation: spin 1s linear infinite;
  }

  &.btn-submit {
    background-color: var(--secondary-button-bg, ${colors.gray600});
    color: var(--secondary-button-text-color, white);

    svg {
      fill: currentColor;
    }

    &:hover {
      background-color: var(--secondary-button-bg--hover, ${colors.gray700});
    }

    &:active {
      background-color: var(--secondary-button-bg--active, ${colors.gray800});
    }
  }
`;
