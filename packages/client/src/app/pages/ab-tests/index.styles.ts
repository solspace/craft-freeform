import { borderRadius, colors, shadows } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ABWrapper = styled.div`
  display: flex;
  margin-bottom: 50px;

  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.box};
`;

export const ABEditorPanel = styled.div`
  flex: 1;
  background-color: ${colors.white};
  border-radius: 0 ${borderRadius.lg} ${borderRadius.lg} 0;
`;
