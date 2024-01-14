import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const CellBadgesWrapper = styled.div`
  display: flex;
  flex-direction: row;

  gap: ${spacings.sm};
  margin-left: ${spacings.sm};
`;
