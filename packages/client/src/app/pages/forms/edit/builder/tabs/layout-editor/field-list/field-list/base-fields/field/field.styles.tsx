import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  cursor: pointer;

  display: flex;
  gap: ${spacings.sm};
  align-items: center;

  height: 32px;

  padding: ${spacings.sm};
  overflow: hidden;

  background: ${colors.white};
  border: 1px solid ${colors.gray200};

  font-size: 12px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier,
    monospace;
`;

export const Name = styled.span`
  flex: 1;
  line-height: 12px;
`;

export const Icon = styled.div`
  display: block;
  flex-basis: 24px;
  height: 24px;

  color: ${colors.gray200};
`;
