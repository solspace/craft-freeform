import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

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

export const DragHandle = styled.div`
  cursor: pointer;
  position: absolute;
  top: 14px;
  right: 40px;
  z-index: 2;

  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }

  svg {
    width: 16px;
    height: 16px;
    fill: ${colors.gray400};
  }
`;
