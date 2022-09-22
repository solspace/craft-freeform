import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${spacings.sm};

  width: 300px;
  margin: 0;
  padding: ${spacings.sm} ${spacings.sm};

  background: ${colors.gray050};
  list-style: none;
`;
