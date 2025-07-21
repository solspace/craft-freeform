import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { PreviewTable } from '../table/table.preview.styles';

export const PreviewContainer = styled(PreviewTable)`
  padding: ${spacings.sm};

  mark {
    padding: ${spacings.xs} ${spacings.sm};
    border-radius: ${borderRadius.lg};
    background: ${colors.gray100};
  }
`;
