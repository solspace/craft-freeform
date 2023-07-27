import { labelText } from '@ff-client/styles/mixins';
import { borderRadius, colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const RecipientWrapper = styled.ul``;

export const Icon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex-shrink: 0;
  flex-basis: 40px;

  border-right: 1px solid rgba(96, 125, 159, 0.25);
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

  border: none;
  outline: none;
  min-height: 100% !important;

  background-color: transparent;

  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none !important;
  }

  &::placeholder {
    color: ${colors.gray200};
  }
`;

export const Button = styled.button`
  padding: 0 10px;
  opacity: 0;

  transform: rotate(-40deg);
  transition: all 0.2s ease-out;

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
  border: 1px solid rgba(96, 125, 159, 0.25);

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
