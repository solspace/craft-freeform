import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PropertyEditorWrapper = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};

  background: ${colors.white};
  padding: ${spacings.xl};

  h1 {
    margin: 0;
    padding: 7.75px 0 8.75px;
  }
`;

export const SettingsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};
`;
