import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { PreviewTable } from '../table/table.preview.styles';

export const Pre = styled.pre`
  font-size: 10px;
`;

export const PreviewContainer = styled(PreviewTable)`
  height: auto;
  min-height: 30px;
  padding: ${spacings.sm};

  a {
    pointer-events: none;
  }
`;
