import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const DateExpressionWrapper = styled.div`
  position: relative;
  width: 100%;

  > input.text { padding-inline-end: 36px; }
`;

export const CalendarButton = styled.button`
  position: absolute;
  inset-inline-end: 1px;
  top: 1px;
  bottom: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  padding: 0;
  color: ${colors.gray500};
  border: 0;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;

  &:hover:not(:disabled) { background: ${colors.gray100}; }
  &:focus-visible { outline: 2px solid ${colors.blue500}; outline-offset: -2px; }
  &:disabled { opacity: 0.5; cursor: default; }
  > svg { display: block; width: 16px; height: 16px; }
`;
