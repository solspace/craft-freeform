import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const GroupWrapper = styled.div``;

export const GroupContainer = styled.div`
  display: grid;
  gap: ${spacings.xl};
  grid-template-columns: repeat(2, 1fr);
`;
