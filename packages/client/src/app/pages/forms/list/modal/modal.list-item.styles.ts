import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  cursor: pointer;
  gap: 30px;
  width: 100%;
  overflow: hidden;
  background: ${colors.white};
  border: 1px solid ${colors.gray100};
  border-radius: 3px;
  font-size: 12px;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);
    border: 1px solid ${colors.gray200};
    background-color: ${colors.gray050};
  }
`;

export const FormDetails = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`;

export const Name = styled.h2`
  flex: 1;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 0;
`;

export const ID = styled.span`
  font-size: 14px;
`;

export const Remove = styled.div`
  color: ${colors.gray500};
  margin-right: ${spacings.xs};
  position: absolute;
  right: 8px;
  top: 7px;
`;

export const PaddedChartFooter = styled.div<{ $color: string }>`
  margin-top: -3px;
  background-color: ${({ $color }) => $color};
  opacity: 0.3;
  height: 5px;
  font-size: 1px;
  line-height: 1px;
  overflow: hidden;
`;
