import { scrollBar } from '@ff-client/styles/mixins';
import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PropertyEditorWrapper = styled.div`
  flex: 1;

  background: ${colors.white};
  padding: ${spacings.xl};

  overflow-y: auto;

  ${scrollBar};
`;

export const SettingsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
