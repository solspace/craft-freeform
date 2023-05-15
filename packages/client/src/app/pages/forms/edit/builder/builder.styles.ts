import { borderRadius, colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const BuilderWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  height: 100%;

  overflow: hidden;

  box-shadow: 0 0 0 1px ${colors.gray200}, 0 2px 12px rgb(205 216 228 / 50%);
  border-radius: ${borderRadius.lg};
`;

export const BuilderContent = styled.div`
  flex-grow: 1;
  overflow: hidden;
`;
