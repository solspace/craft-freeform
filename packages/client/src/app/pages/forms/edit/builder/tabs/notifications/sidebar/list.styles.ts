import { scrollBar } from '@ff-client/styles/mixins';
import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ScrollableList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.sm};
  height: 100%;

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};
`;
