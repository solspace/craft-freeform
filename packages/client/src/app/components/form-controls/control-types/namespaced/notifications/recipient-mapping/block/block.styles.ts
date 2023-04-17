import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const BlockWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacings.md};
`;
