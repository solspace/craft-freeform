import { scrollBar } from '@ff-client/styles/mixins';
import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const RulesEditorWrapper = styled.div`
  position: relative;

  flex: 1;

  background: ${colors.white};
  padding: ${spacings.xl};

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};
`;
