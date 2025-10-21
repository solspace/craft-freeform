import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ValueInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0px;

  margin-left: 5px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const OriginalValuePreview = styled.span`
  width: 200px;
  display: block;
  padding: 0 5px;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  background: #00000005;
  color: ${colors.gray300};
`;
