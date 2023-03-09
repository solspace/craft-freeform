import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const EditorWrapper = styled.div`
  flex: 1;

  background: ${colors.white};
  padding: ${spacings.xl};
`;

export const SettingsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};
`;
