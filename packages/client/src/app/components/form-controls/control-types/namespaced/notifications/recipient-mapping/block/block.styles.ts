import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const BlockWrapper = styled.div`
  display: grid;
  align-items: center;
  gap: ${spacings.md};

  grid-template-columns: 1fr 1fr 2fr;
`;
