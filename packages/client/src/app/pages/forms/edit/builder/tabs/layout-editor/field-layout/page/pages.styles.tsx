import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PageWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacings.md};
`;
