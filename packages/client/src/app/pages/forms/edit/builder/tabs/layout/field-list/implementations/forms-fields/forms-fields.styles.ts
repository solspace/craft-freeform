import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const FormFieldsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.sm};
`;

export const FormFieldsTitle = styled.h2`
  margin: 0;
  padding: 0 0 5px;
`;

export const FormFieldsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.sm};

  &[hidden] {
    display: none;
  }
`;

export const FormFieldsToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacings.sm};
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--link-color, #1f5fea);
    outline-offset: 3px;
  }
`;

export const FormFieldsChevron = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 12px;
  height: 12px;
  opacity: 0.7;
  transition: transform 0.15s ease;

  svg {
    height: 12px;
    fill: currentColor;
  }

  [aria-expanded="true"] > & {
    transform: rotate(90deg);
  }
`;
