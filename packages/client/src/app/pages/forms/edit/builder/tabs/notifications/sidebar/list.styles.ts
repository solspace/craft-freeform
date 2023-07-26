import { scrollBar } from '@ff-client/styles/mixins';
import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ScrollableList = styled.div`
  padding: ${spacings.xs} ${spacings.sm};
  height: 100%;

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};
`;
