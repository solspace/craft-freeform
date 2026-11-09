import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const SubmitFormWrapper = styled.div`
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: ${spacings.xs};

  padding: ${spacings.xs} ${spacings.sm};
  border: 1px solid light-dark(#cdd8e4, ${colors.border});
  background-color: light-dark(${colors.white}, ${colors.surface});

  border-radius: ${borderRadius.md};

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: var(--border-success);
    background-color: light-dark(${colors.teal050}, var(--bg-success));
  }

  &.active {
    background-color: light-dark(${colors.gray500}, var(--bg-selection-dark));
    border-color: ${colors.border};

    color: white;
    fill: currentColor;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const Label = styled.label`
  cursor: pointer;

  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
