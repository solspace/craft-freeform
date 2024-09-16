import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.sm};
`;

export const FlexRow = styled.div`
  display: flex;
  gap: ${spacings.sm};
`;
