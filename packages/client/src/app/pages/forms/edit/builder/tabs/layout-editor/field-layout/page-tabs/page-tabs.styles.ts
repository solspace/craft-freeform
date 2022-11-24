import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PageTabsWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  border-bottom: 1px solid ${colors.gray200};
  margin-bottom: ${spacings.lg};
`;

export const PageTabsContainer = styled.div`
  display: flex;
`;
