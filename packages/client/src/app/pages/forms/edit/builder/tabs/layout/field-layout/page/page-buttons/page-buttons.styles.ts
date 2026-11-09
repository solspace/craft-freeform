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
    background: light-dark(#f3f7fd, ${colors.mutedSurface});

    &:not(.active) {
      border: 1px solid light-dark(#cdd8e4, var(--hairline-color, #cdd8e4));
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
    background-color: light-dark(${colors.gray600}, var(--secondary-button-bg, ${colors.gray600}));
    color: light-dark(white, var(--secondary-button-text-color, white));

    svg {
      fill: light-dark(white, currentColor);
    }

    &:hover {
      background-color: light-dark(${colors.gray700}, var(--secondary-button-bg--hover, ${colors.gray700}));
    }

    &:active {
      background-color: var(--secondary-button-bg--active, ${colors.gray800});
    }
  }
`;
