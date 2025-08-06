import { borderRadius, shadows } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const IntegrationsWrapper = styled.div`
  display: flex;
  max-height: calc(100vh - 150px);

  margin-bottom: 30px;

  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.box};
`;
