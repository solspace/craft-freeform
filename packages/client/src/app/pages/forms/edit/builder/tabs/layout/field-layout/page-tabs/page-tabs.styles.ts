import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PageTabsWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  border-bottom: 1px solid ${colors.gray200};
  padding: 27px ${spacings.xl} 0;
`;

export const PageTabsContainer = styled.div`
  display: flex;
`;
