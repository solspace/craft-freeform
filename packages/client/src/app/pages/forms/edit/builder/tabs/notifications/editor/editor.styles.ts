import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PropertyEditorWrapper = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};

  background: ${colors.white};
  padding: ${spacings.xl};
`;
