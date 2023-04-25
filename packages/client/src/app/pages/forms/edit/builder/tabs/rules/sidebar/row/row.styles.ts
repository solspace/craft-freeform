import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: stretch;
  gap: ${spacings.xs};
`;
