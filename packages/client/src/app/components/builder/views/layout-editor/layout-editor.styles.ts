import { borderRadius } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Grid = styled.div`
  position: relative;
  display: flex;
  gap: 0;

  height: 100%;

  background: #fff;
  border-radius: 0 0 ${borderRadius.lg} ${borderRadius.lg};
`;
