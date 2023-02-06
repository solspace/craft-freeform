import styled from 'styled-components';

import { PreviewRow as TablePreviewRow } from '../../../table/table.preview.styles';

export const PreviewRow = styled(TablePreviewRow)`
  display: flex;

  > div {
    &:first-child {
      flex-grow: 1;
    }

    &:nth-child(2) {
      flex-shrink: 0;
      flex-basis: 100px;
    }
  }
`;
