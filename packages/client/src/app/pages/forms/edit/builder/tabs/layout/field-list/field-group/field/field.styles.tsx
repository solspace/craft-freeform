import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  cursor: pointer;

  display: flex;
  gap: 6px;
  align-items: center;

  height: 28px;

  padding: 0 4px;
  overflow: hidden;

  background: ${colors.white};
  border: 1px solid ${colors.gray100};
  border-radius: 3px;

  font-size: 12px;

  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    border-color: ${colors.gray200};
    background-color: ${colors.gray050};
  }
`;

export const Name = styled.span`
  flex: 1;
  line-height: 12px;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const Icon = styled.div`
  display: block;
  flex-shrink: 0;
  flex-basis: 18px;
  height: 18px;

  color: ${colors.gray500};
`;
