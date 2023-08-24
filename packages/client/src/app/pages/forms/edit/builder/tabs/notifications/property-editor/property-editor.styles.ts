import { scrollBar } from '@ff-client/styles/mixins';
import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PropertyEditorWrapper = styled.div`
  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};

  background: ${colors.white};
  padding: ${spacings.xl};

  overflow-y: auto;

  ${scrollBar};
`;

export const SettingsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
`;
