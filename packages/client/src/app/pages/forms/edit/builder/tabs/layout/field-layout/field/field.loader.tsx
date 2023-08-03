import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { colors } from '@ff-client/styles/variables';

import { FieldCellWrapper, Instructions, Label } from './cell/cell.styles';
import { FieldWrapper } from './field.styles';

export const LoaderField: React.FC = () => {
  return (
    <FieldWrapper style={{ flex: 1 }}>
      <FieldCellWrapper>
        <Label>
          <Skeleton
            height={10}
            width={60}
            baseColor={colors.gray300}
            highlightColor={colors.gray200}
          />
        </Label>
        <Instructions>
          <Skeleton height={8} width={300} />
        </Instructions>
        <Skeleton height={30} width="100%" />
      </FieldCellWrapper>
    </FieldWrapper>
  );
};
