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
