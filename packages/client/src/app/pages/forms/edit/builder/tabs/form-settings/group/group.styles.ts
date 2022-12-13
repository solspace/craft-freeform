import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const GroupWrapper = styled.div``;

export const GroupContainer = styled.div`
  display: grid;
  gap: ${spacings.xl};
  grid-template-columns: repeat(2, 1fr);
`;

export const GroupHeader = styled.h2`
  padding: 0 0 ${spacings.lg};
  margin: 0;
`;
