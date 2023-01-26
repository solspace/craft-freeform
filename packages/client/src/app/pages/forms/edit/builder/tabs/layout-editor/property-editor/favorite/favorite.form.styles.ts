import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FavoriteFormWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: ${spacings.lg};
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;
