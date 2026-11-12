import type React from "react";
import Skeleton from "react-loading-skeleton";

import { FieldCellWrapper, Instructions, Label } from "./cell/cell.styles";
import { FieldWrapper } from "./field.styles";

export const LoaderField: React.FC = () => {
  return (
    <FieldWrapper style={{ flex: 1 }}>
      <FieldCellWrapper>
        <Label>
          <Skeleton height={10} width={60} />
        </Label>
        <Instructions>
          <Skeleton height={8} width={300} />
        </Instructions>
        <Skeleton height={30} width="100%" />
      </FieldCellWrapper>
    </FieldWrapper>
  );
};
