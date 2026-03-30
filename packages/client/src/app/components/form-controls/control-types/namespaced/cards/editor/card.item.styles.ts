import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Item = styled.li`
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;

  padding: 12px 16px;

  background-color: ${colors.white};
  border: 1px solid #eee;
  border-radius: 8px;

  &:hover {
    border-color: ${colors.gray300};
  }
`;

export const TextArea = styled.textarea`
  // prevent resize of text area
  resize: none;
`;

export const ActionButton = styled.button`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: 2px;

  fill: ${colors.gray400};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.2);
  }

  &.active {
    fill: ${colors.blue500};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const PillWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  > span {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 18px;
    height: 18px;

    padding: 2px;

    border: 1px solid ${colors.gray300};
    border-radius: 100%;

    font-size: 10px;

    &.filled {
      background-color: ${colors.teal600};
      border: 1px solid ${colors.teal600};
      color: ${colors.white};
    }
  }
`;

export const Actions = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;

  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StatusStrip = styled.div`
  width: 100%;
  padding: 0;

  text-align: left;

  &.error {
    color: ${colors.red500};
    fill: ${colors.red700};
  }

  &.success {
    color: ${colors.teal500};
    fill: ${colors.teal500};
  }

  > span {
    display: flex;
    align-items: center;
    gap: 5px;

    font-size: 12px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  > div {
    padding: 3px 8px;

    font-size: 11px !important;

    background-color: ${colors.red050};
    border: 1px solid ${colors.red500};
    border-radius: 5px;
  }
`;

export const EditorWrapper = styled.div`
  border: 1px solid ${colors.inputBorder};
  border-radius: 3px;
`;
