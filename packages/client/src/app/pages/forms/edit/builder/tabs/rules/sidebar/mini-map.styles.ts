import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { RowWrapper } from './row/row.styles';

export const MiniMapWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};
`;

export const LoadingRow = styled(RowWrapper)`
  > span {
    width: 100%;
  }
`;
