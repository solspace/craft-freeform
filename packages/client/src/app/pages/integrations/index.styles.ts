import { borderRadius, colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const IntegrationsWrapper = styled.div`
  display: flex;
  margin-bottom: 50px;
`;

export const IntegrationsEditorPanel = styled.div`
  flex: 1;
  background-color: ${colors.white};
  border-radius: 0 ${borderRadius.lg} ${borderRadius.lg} 0;
`;
