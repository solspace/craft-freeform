import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${spacings.sm};

  list-style: none;
`;
