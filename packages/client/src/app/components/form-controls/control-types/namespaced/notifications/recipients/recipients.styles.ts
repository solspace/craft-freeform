import { AddButtonArea } from "@components/elements/add-button-area/add-button-area";
import { labelText } from "@ff-client/styles/mixins";
import { borderRadius, colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const RecipientEditor = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  min-width: 0;
`;

export const RecipientWrapper = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const AddRecipientButton = styled(AddButtonArea)`
  box-sizing: border-box;
  border-color: ${colors.inputBorder};

  && > .btn {
    border-radius: inherit;
    color: ${colors.text};
    background: var(--button-bg, ${colors.gray050});

    &:hover:not(:disabled) {
      background: var(--button-bg--hover, ${colors.gray100});
    }

    &:focus-visible {
      box-shadow: var(--focus-ring-inner);
    }
  }
`;

export const Icon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex-shrink: 0;
  flex-basis: 40px;

  border-inline-end: 1px solid ${colors.inputBorder};
  background-color: ${colors.gray050};

  ${labelText};
  font-weight: normal;

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const EmailInput = styled.input`
  flex-grow: 1;
  min-width: 0;

  border: none;
  border-radius: 0;
  outline: none;
  min-height: 100% !important;

  background-color: ${colors.inputBackground};
  color: ${colors.text};

  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none !important;
  }

  &::placeholder {
    color: ${colors.muted};
  }
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  color: ${colors.muted};
  background: transparent;
  opacity: 0;

  transform: rotate(-40deg);
  transition: all 0.2s ease-out;

  &:hover { color: ${colors.text}; }

  &:focus {
    outline: none;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const RecipientItem = styled.li`
  display: flex;
  justify-content: space-between;
  gap: 0;

  overflow: hidden;
  background-color: ${colors.inputBackground};
  border: 1px solid ${colors.inputBorder};

  &:hover {
    ${Button} {
      transform: rotate(0deg);
      opacity: 1;
    }
  }

  &:not(:last-child) {
    border-bottom: none;
  }

  &:first-child {
    border-top-left-radius: ${borderRadius.lg};
    border-top-right-radius: ${borderRadius.lg};
  }

  &:last-child {
    border-bottom-left-radius: ${borderRadius.lg};
    border-bottom-right-radius: ${borderRadius.lg};
  }
`;

export const RecipientList = styled(RecipientEditor)`
  ${RecipientWrapper}:not(:last-child) ${RecipientItem}:last-child {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }
`;
